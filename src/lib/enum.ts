export const IngestionStatus = {
  pending : "PENDING",
  processing : "PROCESSING",
  completed : "COMPLETED",
  partial : "PARTIAL",
  failed : "FAILED",
} as const

export const IngestionStatusesArray = Object.keys(IngestionStatus)