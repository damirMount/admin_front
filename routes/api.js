const baseURL = process.env.NEXT_PUBLIC_URL

export const GET_DATA_FROM_DB_URL = `${baseURL}/api/getDataFromDB`


export const GET_LIST_SERVICES_URL = `${baseURL}/api/listServices`
export const POST_ABONENT_SERVICE_URL = `${baseURL}/api/abonent-service/store`
export const POST_LOGIN_URL = `${baseURL}/api/login`

export const RECIPIENT_CREATE_URL = `${baseURL}/api/recipient`
export const RECIPIENT_SHOW_URL = `${baseURL}/api/recipient`
export const RECIPIENT_UPDATE_URL = `${baseURL}/api/recipient`
export const RECIPIENT_DELETE_URL = `${baseURL}/api/recipient`

export const REGISTRY_CREATE_URL = `${baseURL}/api/registry`
export const REGISTRY_SHOW_URL = `${baseURL}/api/registry`
export const REGISTRY_UPDATE_URL = `${baseURL}/api/registry`
export const REGISTRY_DELETE_URL = `${baseURL}/api/registry`


export const REGISTRY_RESEND_URL = `${baseURL}/api/registry/resend`
export const GET_PAYMENTS_URL = `${baseURL}/api/registry/payments`

export const REGISTRY_BACKUP_INDEX_URL = `${baseURL}/api/registryBackup/index/`
export const REGISTRY_BACKUP_DOWNLOAD_URL = `${baseURL}/api/registryBackup/download`

export const REGISTRY_LOG_INDEX_URL = `${baseURL}/api/registryLog/index/`
export const REGISTRY_LOG_DOWNLOAD_URL = `${baseURL}/api/registryLog/download`

export const ACQUIRING_COMPARISON_URL = `${baseURL}/api/acquiring/comparison`

export const DEALER_REPORTS_EXPORT_URL = `${baseURL}/api/dealer/reports/createReport`
export const DEALER_REPORTS_UPDATE_TSJ_DEALER_URL = `${baseURL}/api/dealer/reports/updateTSJDealer`
