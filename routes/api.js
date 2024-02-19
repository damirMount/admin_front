const baseURL = process.env.NEXT_PUBLIC_API

export const POST_LOGIN_API = `${baseURL}/api/login`

export const GET_DATA_FROM_DB_API = `${baseURL}/api/getDataFromDB`

export const GET_LIST_SERVICES_API = `${baseURL}/api/listServices`

export const POST_ABONENT_SERVICE_API = `${baseURL}/api/abonent-service/store`

export const RECIPIENT_CREATE_API = `${baseURL}/api/recipient`
export const RECIPIENT_SHOW_API = `${baseURL}/api/recipient`
export const RECIPIENT_UPDATE_API = `${baseURL}/api/recipient`
export const RECIPIENT_DELETE_API = `${baseURL}/api/recipient`

export const REGISTRY_CREATE_API = `${baseURL}/api/registry`
export const REGISTRY_SHOW_API = `${baseURL}/api/registry`
export const REGISTRY_UPDATE_API = `${baseURL}/api/registry`
export const REGISTRY_DELETE_API = `${baseURL}/api/registry`


export const REGISTRY_RESEND_API = `${baseURL}/api/registry/resend`
export const GET_PAYMENTS_API = `${baseURL}/api/registry/payments`

export const REGISTRY_BACKUP_INDEX_API = `${baseURL}/api/registryBackup/index/`
export const REGISTRY_BACKUP_DOWNLOAD_API = `${baseURL}/api/registryBackup/download`

export const REGISTRY_LOG_INDEX_API = `${baseURL}/api/registryLog/index/`
export const REGISTRY_LOG_DOWNLOAD_API = `${baseURL}/api/registryLog/download`

export const ACQUIRING_COMPARISON_API = `${baseURL}/api/acquiring/comparison`

export const DEALER_REPORTS_EXPORT_API = `${baseURL}/api/dealer/reports/createReport`
export const DEALER_REPORTS_UPDATE_TSJ_DEALER_API = `${baseURL}/api/dealer/reports/updateTSJDealer`


export const GSFR_UPDATE_API = `${baseURL}/api/GSFR/updateGFSR`
