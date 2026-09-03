"""Build-time helper: extracts country starter destinations from a Wikivoyage XML dump."""
import bz2
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

DUMP = Path("/tmp/enwikivoyage-pages.xml.bz2")
COUNTRIES = Path("/tmp/world-countries.json")
OUTPUT = Path("/tmp/wv-topplaces.json")

TITLE_OVERRIDES = {
    "BOL": "Bolivia", "BRN": "Brunei", "COD": "Democratic Republic of the Congo",
    "COG": "Republic of the Congo", "CIV": "Côte d'Ivoire", "CZE": "Czech Republic",
    "FSM": "Micronesia", "IRN": "Iran", "LAO": "Laos", "MDA": "Moldova",
    "MKD": "North Macedonia", "PSE": "Palestinian territories", "RUS": "Russia",
    "KOR": "South Korea", "PRK": "North Korea", "SYR": "Syria", "TZA": "Tanzania",
    "USA": "United States of America", "VAT": "Vatican City", "VEN": "Venezuela", "VNM": "Vietnam",
}

def section(text, heading):
    match = re.search(rf"^==\s*{re.escape(heading)}\s*==\s*$", text, re.I | re.M)
    if not match:
        return ""
    rest = text[match.end():]
    end = re.search(r"^==[^=].*==\s*$", rest, re.M)
    return rest[:end.start()] if end else rest

def clean(value):
    value = value.strip().replace("'''", "").replace("''", "")
    link = re.match(r"^\[\[([^]]+)]]$", value)
    if link:
        value = link.group(1)
    return value.split("|")[-1].strip()

def marker_names(block):
    values = []
    for match in re.finditer(r"\{\{marker\|[^}\n]*?name=(\[\[[^]]+]]|[^|}\n]+)", block, re.I):
        value = clean(match.group(1))
        if value and value not in values:
            values.append(value)
    return values

def top_places(text):
    cities = marker_names(section(text, "Cities"))
    destinations = marker_names(section(text, "Other destinations"))
    combined = cities[:2] + destinations[:3] + cities[2:] + destinations[3:]
    return list(dict.fromkeys(combined))[:5]

countries = json.loads(COUNTRIES.read_text())
sovereign = [item for item in countries if item.get("unMember") or item["cca3"] in {"PSE", "VAT"}]
title_to_id = {TITLE_OVERRIDES.get(item["cca3"], item["name"]["common"]): item["cca3"] for item in sovereign}
remaining = set(title_to_id)
result = {}

with bz2.open(DUMP, "rb") as stream:
    for _, elem in ET.iterparse(stream, events=("end",)):
        if not elem.tag.endswith("page"):
            continue
        title_node = next((child for child in elem if child.tag.endswith("title")), None)
        title = title_node.text if title_node is not None else None
        if title in remaining:
            text_node = next((node for node in elem.iter() if node.tag.endswith("text")), None)
            text = text_node.text or "" if text_node is not None else ""
            places = top_places(text)
            if places:
                result[title_to_id[title]] = places
            remaining.remove(title)
        elem.clear()

OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2))
print(f"Znaleziono listy dla {len(result)} z {len(sovereign)} krajów; brak stron/list: {len(remaining)}")
