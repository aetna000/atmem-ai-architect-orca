export const templates = [
  {
    "id": "private-storage",
    "title": "Private file storage",
    "description": "A private document bucket with encryption, versioning and blocked public access.",
    "provider": "AWS",
    "components": 2,
    "preview": "../assets/templates/private-storage.svg"
  },
  {
    "id": "document-processing",
    "title": "Document processing",
    "description": "Queue incoming documents, process them with a worker, and keep failed jobs for recovery.",
    "provider": "AWS",
    "components": 6,
    "preview": "../assets/templates/document-processing.svg"
  },
  {
    "id": "knowledge-assistant",
    "title": "Knowledge assistant",
    "description": "A signed-in web assistant with document connectors, a catalog and cited answers.",
    "provider": "AWS",
    "components": 10,
    "preview": "../assets/templates/knowledge-assistant.svg"
  }
]
