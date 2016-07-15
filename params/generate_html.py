import json
from argparse import ArgumentParser

PARAMS_JSON = "params.json"
CONFIGURATION_JSON = "configuration.json"
ADPLAN_JSON = "adPlan_requests.json"
VIDEO_EVENTS_JSON = "video_start-video_end_requests.json"
HTML_OUTFILE = "docs.html"
MARKDOWN_OUTFILE = "docs.md"
PARAM_ORDER = ["key", "type", "description", "provider", "platforms"]

PARAM_FIELDS_IN_EVENT = ["key", "required", "queryString", "body", "type",
                         "description", "provider", "platforms"]
ALL_PARAMS_HEAD = "All Parameters"
CONFIGURATION_HEAD = "Configuration"
ADPLAN_REQ_HEAD = "adPlan Requests"
VIDEO_EVENTS_HEAD = "Video events"


class Creator(object):
    def header_to_anchor(self, header):
        return header.lower().replace(" ", "-")

    def create_event_table(self, event_name, json_path):
        event_dict = json.load(open(json_path))
        event_html_str = self.create_table_head(PARAM_FIELDS_IN_EVENT)
        for event_param in event_dict["parameters"]:
            param = next(d for d in params if d['key'] == event_param['parameter'])
            these_fields = {}
            these_fields.update(event_param)
            these_fields.update(param)
            values = []
            for key in PARAM_FIELDS_IN_EVENT:
                values.append(these_fields[key])
            event_html_str += self.create_table_row(values)

        return self.create_table(event_name, event_html_str)


class HtmlCreator(Creator):
    def create_toc(self, header_names_array):
        index_part = "<h3> TOC <h3>\n"
        for header_name in header_names_array:
            anchor_link_name = self.header_to_anchor(header_name)
            index_part += "<a href=\"#%s\">%s</a><br>" % (anchor_link_name,
                                                          header_name)
        return index_part

    def create_table_head(self, items_array):
        header_str = "<tr>"
        for item in items_array:
            header_str += "<th>" + item + "</th>"
        header_str += "</tr>\n"
        return header_str

    def create_table_row(self, values_array):
        row_str = "<tr>"
        for value in values_array:
            row_str += "<td>" + (value or "<UNDEFINED!>") + "</td>"
        row_str += "</tr>\n"
        return row_str

    def create_table(self, title, content_str):
        anchor_name = markdown_link_name = self.header_to_anchor(title)
        anchor_tag = "</h3> <a name=\"%s\"></a>" % anchor_name
        return "%s <h3> %s </h3> \n <table> %s </table>" % (anchor_tag,
                                                            title,
                                                            content_str)

    def create_page(self, content_str_array):
        combined_content = ""
        for content in content_str_array:
            combined_content += "<br><br>"
            combined_content += content
        return """
               <html>
               <head></head>
               <style>
               table, th, td {
                   border: 1px solid black;
               }
               </style>
               <body>""" + combined_content + "</body></html>"


class MarkdownCreator(Creator):
    def create_toc(self, header_names_array):
        index_part = "### TOC\n"
        for header_name in header_names_array:
            markdown_link_name = self.header_to_anchor(header_name)
            # Do not remove the two trailing whitespaces below,
            # they force a newline
            index_part += "[%s](#%s)  \n" % (header_name, markdown_link_name)
        return index_part

    def create_table_head(self, items_array):
        header_str = self.create_table_row(items_array)
        for item in items_array:
            header_str += "|---"
        header_str += "|\n"
        return header_str

    def create_table_row(self, values_array):
        row_str = "|"
        for value in values_array:
            row_str += " " + (value or "NA") + " |"
        row_str += "\n"
        return row_str

    def create_table(self, title, content_str):
        return "### " + title + "\n" + content_str + "\n"

    def create_page(self, content_str_array):
        combined_content = ""
        for content in content_str_array:
            combined_content += "\n\n"
            combined_content += content
        return combined_content


parser = ArgumentParser(description="Generate Document based on json")
parser.add_argument('-d',
                    '--documentType',
                    dest='document_type',
                    help='What Document type are we going to generate.\
                    Possible values HTML or MD')
args = parser.parse_args()

document_type = args.document_type

print(document_type)
# default to MD
if not document_type or document_type.upper() == "MD":
    print("Markdown creator")
    this_creator = MarkdownCreator()
    outfile = MARKDOWN_OUTFILE
elif document_type.upper() == "HTML":
    print("HTML Creator")
    this_creator = HtmlCreator()
    outfile = HTML_OUTFILE

params = json.load(open(PARAMS_JSON))

params_html_str = this_creator.create_table_head(PARAM_ORDER)
for param in params:
    values = []
    for key in PARAM_ORDER:
        values.append(param[key])
    params_html_str += this_creator.create_table_row(values)

all_params_table = this_creator.create_table(ALL_PARAMS_HEAD, params_html_str)

configuration_table = this_creator.create_event_table(CONFIGURATION_HEAD,
                                                      CONFIGURATION_JSON)
adPlan_table = this_creator.create_event_table(ADPLAN_REQ_HEAD,
                                               ADPLAN_JSON)
video_events_table = this_creator.create_event_table(VIDEO_EVENTS_HEAD,
                                                     VIDEO_EVENTS_JSON)

table_of_contents = this_creator.create_toc([ALL_PARAMS_HEAD,
                                            CONFIGURATION_HEAD,
                                            ADPLAN_REQ_HEAD,
                                            VIDEO_EVENTS_HEAD])

f = open(outfile, 'w')
f.write(this_creator.create_page([table_of_contents,
                                  all_params_table,
                                  configuration_table,
                                  adPlan_table,
                                  video_events_table]))
f.close()
