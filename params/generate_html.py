import json

PARAMS_JSON = "params.json"
CONFIGURATION_JSON = "configuration.json"
ADPLAN_JSON = "adPlan_requests.json"
VIDEO_EVENTS_JSON = "video_start-video_end_requests.json"
HTML_OUTFILE = "docs.html"
MARKDOWN_OUTFILE = "docs.md"
PARAM_ORDER = ["key", "type", "description", "provider", "platforms"]

PARAM_FIELDS_IN_EVENT = ["key", "required", "queryString", "body", "type",
                         "description", "provider", "platforms"]

CREATE_MARKDOWN = True


class Creator:
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
        return "<h3>" + title + "</h3>" + "<table>" + content_str + "</table>"

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


this_creator = HtmlCreator()
outfile = HTML_OUTFILE
if CREATE_MARKDOWN:
    this_creator = MarkdownCreator()
    outfile = MARKDOWN_OUTFILE

params = json.load(open(PARAMS_JSON))

params_html_str = this_creator.create_table_head(PARAM_ORDER)
for param in params:
    values = []
    for key in PARAM_ORDER:
        values.append(param[key])
    params_html_str += this_creator.create_table_row(values)

all_params_table = this_creator.create_table("All Parameters", params_html_str)

configuration_table = this_creator.create_event_table("Configuration",
                                                      CONFIGURATION_JSON)
adPlan_table = this_creator.create_event_table("adPlan Requests",
                                               ADPLAN_JSON)
video_events_table = this_creator.create_event_table("Video events",
                                                     VIDEO_EVENTS_JSON)

f = open(outfile, 'w')
f.write(this_creator.create_page([all_params_table, configuration_table,
                                  adPlan_table, video_events_table]))
f.close()
