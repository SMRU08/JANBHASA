import sys
import json
import aikosh

API_KEY = "234c91c6b1f8ee05f374c21c7f24b9632837909ca70de38948dff14a6ef199a6"
aikosh.set_api_key(API_KEY)

def list_all_datasets(limit=10):
    print(f"\n[AIKosh] Fetching top {limit} datasets from IndiaAI platform...")
    res = aikosh.list_directory("data", limit=limit, offset=0)
    datasets = res.get("data", {}).get("data", [])
    print(f"[AIKosh] Found {len(datasets)} datasets:\n")
    for i, d in enumerate(datasets, 1):
        d_id = d.get("id")
        d_name = d.get("name")
        d_sector = d.get("datasetMetadata", {}).get("sector", {}).get("name", "N/A")
        print(f" {i:2d}. ID: {d_id}")
        print(f"     Name:   {d_name}")
        print(f"     Sector: {d_sector}\n")
    return datasets

def download_metadata(dataset_id):
    print(f"\n[AIKosh] Downloading full metadata for Dataset ID: {dataset_id}...")
    try:
        meta = aikosh.get_dataset_metadata(dataset_id)
        out_filename = f"metadata_{dataset_id}.json"
        with open(out_filename, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
        print(f"[SUCCESS] Metadata successfully saved to: {out_filename}")
        d = meta.get("data", {})
        print(f" - Name: {d.get('name')}")
        desc = d.get('shortDescription') or ''
        print(f" - Description: {desc[:120]}...")
        print(f" - Status: {d.get('status')}")
        print(f" - Access Type: {d.get('accessType')}")
    except Exception as e:
        print(f"[ERROR] Failed to fetch metadata: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        download_metadata(sys.argv[1])
    else:
        datasets = list_all_datasets(limit=10)
        if datasets:
            first_id = datasets[0].get("id")
            print("-" * 65)
            print(f"Downloading metadata for first dataset ({first_id})...")
            download_metadata(first_id)
