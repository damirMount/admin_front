const baseURL = process.env.NEXT_PUBLIC_URL

export const POST_LOGIN_API = `${baseURL}/api/login`

export const GET_DATA_FROM_DB_API = `${baseURL}/api/getDataFromDB`
export const GET_SERVICES_BY_SERVER_API = `${baseURL}/api/getServicesByServer`

export const POST_ABONENT_SERVICE_API = `${baseURL}/api/abonent-service/store`
export const READ_ABONENT_SERVICE_DB_FILE_API = `${baseURL}/api/abonent-service/readUploadedDataFile`
export const GET_ABONENT_SERVICE_TEMPLATE_API = `${baseURL}/api/abonent-service/getTemplate`
export const UPDATE_ABONENT_SERVICE_TEMPLATE_API = `${baseURL}/api/abonent-service/updateTemplate`

export const RECIPIENT_CREATE_API = `${baseURL}/api/recipient`
export const RECIPIENT_SHOW_API = `${baseURL}/api/recipient`
export const RECIPIENT_UPDATE_API = `${baseURL}/api/recipient`
export const RECIPIENT_DELETE_API = `${baseURL}/api/recipient`

export const REGISTRY_CREATE_API = `${baseURL}/api/registry`
export const REGISTRY_SHOW_API = `${baseURL}/api/registry`
export const REGISTRY_UPDATE_API = `${baseURL}/api/registry`
export const REGISTRY_DELETE_API = `${baseURL}/api/registry`
export const GET_REGISTRY_BY_RECIPIENT_API = `${baseURL}/api/getRegistryByRecipient`

export const REGISTRY_RESEND_API = `${baseURL}/api/registry/resend`
export const GET_PAYMENTS_API = `${baseURL}/api/registry/payments`

export const REGISTRY_BACKUP_INDEX_API = `${baseURL}/api/registryBackup/index/`
export const REGISTRY_BACKUP_DOWNLOAD_API = `${baseURL}/api/registryBackup/download`

export const REGISTRY_LOG_INDEX_API = `${baseURL}/api/registryLog/index/`
export const REGISTRY_LOG_DOWNLOAD_API = `${baseURL}/api/registryLog/download`

export const ACQUIRING_COMPARISON_API = `${baseURL}/api/acquiring/comparison`

export const DEALER_REPORTS_EXPORT_API = `${baseURL}/api/reports/dealer/createReport`
export const DEALER_REPORTS_UPDATE_TSJ_DEALER_API = `${baseURL}/api/reports/dealer/updateTSJDealer`

export const GET_NORTHELECTRO_REPORT_API = `${baseURL}/api/reports/service/northelectro`
export const DOWNLOAD_NORTHELECTRO_REPORT_API = `${baseURL}/api/reports/service/northelectro/downloadReport`

export const GSFR_UPDATE_API = `${baseURL}/api/GSFR/updateGFSR`

export const PERMISSION_CREATE_API = `${baseURL}/api/permission`
export const PERMISSION_SHOW_API = `${baseURL}/api/permission`
export const PERMISSION_UPDATE_API = `${baseURL}/api/permission`
export const PERMISSION_DELETE_API = `${baseURL}/api/permission`

export const GET_DEALER_BALANCE_API = `${baseURL}/api/dealer/getBalance`
export const GET_DEALER_CREDIT_API = `${baseURL}/api/dealer/getCredit`

export const GET_PAYMENTS_STATISTIC_API = `${baseURL}/api/payments/getTotalPayments`

// export const ROLE_CREATE_API = `${baseURL}/api/role`
export const ROLE_SHOW_API = `${baseURL}/api/role`
export const ROLE_UPDATE_API = `${baseURL}/api/role`
// export const ROLE_DELETE_API = `${baseURL}/api/role`

export const TEST_DATA_UTILS_CREATE_FILE_API = `${baseURL}/api/testZone/testDataUtils/createFile`
export const TEST_DATA_UTILS_READ_FILE_API = `${baseURL}/api/testZone/testDataUtils/readFile`
