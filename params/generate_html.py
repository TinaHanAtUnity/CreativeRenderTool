import json

PARAMS_JSON = "params.json"
CONFIGURATION_JSON = "configuration.json"
ADPLAN_JSON = "adPlan_requests.json"
VIDEO_EVENTS_JSON = "video_start-video_end_requests.json"
HTML_OUTFILE = "docs.html"
PARAM_ORDER = ["key", "type", "description", "provider", "platforms"]

PARAM_FIELDS_IN_EVENT = ["key", "required", "queryString", "body", "type",
                         "description", "provider", "platforms"]


def create_table_head(items_array):
    header_str = "<tr>"
    for item in items_array:
        header_str += "<th>" + item + "</th>"
    header_str += "</tr>\n"
    return header_str


def create_table_row(values_array):
    row_str = "<tr>"
    for value in values_array:
        row_str += "<td>" + (value or "<UNDEFINED!>") + "</td>"
    row_str += "</tr>\n"
    return row_str


def create_table(title, content_str):
    return "<h3>" + title + "</h3>" + "<table>" + content_str + "</table>"


def create_page(content_str):
    return """
           <html>
           <head></head>
           <style>
           table, th, td {
               border: 1px solid black;
           }
           </style>
           <body>""" + content_str + "</body></html>"


def create_event_table(event_name, json_path):
    event_dict = json.load(open(json_path))
    event_html_str = create_table_head(PARAM_FIELDS_IN_EVENT)
    for event_param in event_dict["parameters"]:
        param = next(d for d in params if d['key'] == event_param['parameter'])
        these_fields = {}
        these_fields.update(event_param)
        these_fields.update(param)
        values = []
        for key in PARAM_FIELDS_IN_EVENT:
            values.append(these_fields[key])
        event_html_str += create_table_row(values)

    return create_table(event_name, event_html_str)

params = json.load(open(PARAMS_JSON))

params_html_str = create_table_head(PARAM_ORDER)
for param in params:
    values = []
    for key in PARAM_ORDER:
        values.append(param[key])
    params_html_str += create_table_row(values)

all_params_table = create_table("All Parameters", params_html_str)

configuration_table = create_event_table("Configuration", CONFIGURATION_JSON)
adPlan_table = create_event_table("adPlan Requests", ADPLAN_JSON)
video_events_table = create_event_table("Video events", VIDEO_EVENTS_JSON)

f = open(HTML_OUTFILE, 'w')
f.write(create_page(all_params_table + "<br><br>" +
                    configuration_table + "<br><br>" +
                    adPlan_table + "<br><br>" +
                    video_events_table))
f.close()
