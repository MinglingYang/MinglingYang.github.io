from scholarly import scholarly
import json
from datetime import datetime, timezone
import os


def now_stamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def publication_map(author):
    publications = author.get("publications") or []
    mapped = {}
    for publication in publications:
        publication_id = publication.get("author_pub_id")
        if publication_id:
            mapped[publication_id] = publication
    return mapped


def metric_payload(author, publications):
    return {
        "name": author.get("name", ""),
        "updated": author.get("updated"),
        "citedby": author.get("citedby", 0),
        "citedby5y": author.get("citedby5y", 0),
        "hindex": author.get("hindex", 0),
        "hindex5y": author.get("hindex5y", 0),
        "i10index": author.get("i10index", 0),
        "i10index5y": author.get("i10index5y", 0),
        "publications_count": len(publications),
        "scholar_id": os.environ["GOOGLE_SCHOLAR_ID"],
    }


scope = os.environ.get("SCHOLAR_CRAWL_SCOPE", "full").strip().lower()
author: dict = scholarly.search_author_id(os.environ["GOOGLE_SCHOLAR_ID"])
scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])
author["updated"] = now_stamp()
publications = publication_map(author)

os.makedirs("results", exist_ok=True)

metrics = metric_payload(author, publications)
with open("results/gs_metrics.json", "w") as outfile:
    json.dump(metrics, outfile, ensure_ascii=False)

shieldio_data = {
    "schemaVersion": 1,
    "label": "citations",
    "message": f"{metrics['citedby']}",
}
with open("results/gs_data_shieldsio.json", "w") as outfile:
    json.dump(shieldio_data, outfile, ensure_ascii=False)

if scope != "metrics":
    author["publications"] = publications
    print(json.dumps(author, indent=2))
    with open("results/gs_data.json", "w") as outfile:
        json.dump(author, outfile, ensure_ascii=False)
else:
    print(json.dumps(metrics, indent=2))
