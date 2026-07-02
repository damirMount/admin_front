const baseURL = process.env.NEXT_PUBLIC_URL + '/api'

export const POST_LOGIN_API = `${baseURL}/login`

export const GET_DATA_FROM_DB_API = `${baseURL}/getDataFromDB`
export const GET_SERVICES_BY_SERVER_API = `${baseURL}/getServicesByServer`

export const POST_ABONENT_SERVICE_API = `${baseURL}/abonent-service/store`
export const READ_ABONENT_SERVICE_DB_FILE_API = `${baseURL}/abonent-service/readUploadedDataFile`
export const GET_ABONENT_SERVICE_TEMPLATE_API = `${baseURL}/abonent-service/getTemplate`
export const UPDATE_ABONENT_SERVICE_TEMPLATE_API = `${baseURL}/abonent-service/updateTemplate`

export const RECIPIENT_CREATE_API = `${baseURL}/recipient`
export const RECIPIENT_SHOW_API = `${baseURL}/recipient`
export const RECIPIENT_UPDATE_API = `${baseURL}/recipient`
export const RECIPIENT_DELETE_API = `${baseURL}/recipient`

export const REGISTRY_CREATE_API = `${baseURL}/registry`
export const REGISTRY_SHOW_API = `${baseURL}/registry`
export const REGISTRY_UPDATE_API = `${baseURL}/registry`
export const REGISTRY_DELETE_API = `${baseURL}/registry`
export const GET_REGISTRY_BY_RECIPIENT_API = `${baseURL}/getRegistryByRecipient`

export const REGISTRY_RESEND_API = `${baseURL}/registry/resend`
export const GET_PAYMENTS_API = `${baseURL}/registry/payments`
export const GET_STATISTICS_PAYMENTS_API = `${baseURL}/statistics/payments`

export const REGISTRY_BACKUP_INDEX_API = `${baseURL}/registryBackup/index/`
export const REGISTRY_BACKUP_DOWNLOAD_API = `${baseURL}/registryBackup/download`

export const REGISTRY_LOG_INDEX_API = `${baseURL}/registryLog/index/`
export const REGISTRY_LOG_DOWNLOAD_API = `${baseURL}/registryLog/download`

export const ACQUIRING_COMPARISON_API = `${baseURL}/acquiring/comparison`

export const DEALER_CREATE_PAYMENTS_REPORT_API = `${baseURL}/reports/dealer/createReport`
export const DEALER_EXPORT_REPORT_1C_API = `${baseURL}/reports/dealer/exportReport1C`
export const DEALER_REPORTS_UPDATE_TSJ_DEALER_API = `${baseURL}/reports/dealer/updateTSJDealer`

export const GET_NORTHELECTRO_REPORT_API = `${baseURL}/reports/service/northelectro`
export const DOWNLOAD_NORTHELECTRO_REPORT_API = `${baseURL}/reports/service/northelectro/downloadReport`

export const GET_GAZPROM_REPORT_API = `${baseURL}/reports/service/gazprom`
export const DOWNLOAD_GAZPROM_REPORT_API = `${baseURL}/reports/service/gazprom/downloadReport`

export const GSFR_UPDATE_API = `${baseURL}/GSFR/updateGFSR`

export const PERMISSION_CREATE_API = `${baseURL}/permission`
export const PERMISSION_SHOW_API = `${baseURL}/permission`
export const PERMISSION_UPDATE_API = `${baseURL}/permission`
export const PERMISSION_DELETE_API = `${baseURL}/permission`

export const ANTIFRAUD_RULE_CREATE_API = `${baseURL}/antiFraud/rule`
export const ANTIFRAUD_RULE_UPDATE_API = `${baseURL}/antiFraud/rule`
export const ANTIFRAUD_RULES_UPDATE_ORDER_API = `${baseURL}/antiFraud/rules/order`
export const ANTIFRAUD_SETTINGS_UPDATE_API = `${baseURL}/antiFraud/rules/settings`
export const GET_ANTIFRAUD_HISTORY_API = `${baseURL}/antiFraud/history`
export const GET_ANTIFRAUD_STATISTIC_API = `${baseURL}/antiFraud/statistic`
export const GET_ANTIFRAUD_HISTORY_DETAIL_API = `${baseURL}/antiFraud/history`
export const ANTIFRAUD_OPERATOR_ACTION_API = `${baseURL}/antiFraud/operator/action`
export const GET_ANTIFRAUD_PROFILE_API = `${baseURL}/antiFraud/profiles`
export const GET_ANTIFRAUD_PROFILE_PAYMENTS_API = `${baseURL}/antiFraud/profiles/payments`
export const UPDATE_ANTIFRAUD_PROFILE_API = `${baseURL}/antiFraud/profiles/update`

export const GET_DEALER_BALANCE_API = `${baseURL}/dealer/getBalance`
export const GET_DEALER_CREDIT_API = `${baseURL}/dealer/getCredit`

export const GET_PAYMENTS_STATISTIC_API = `${baseURL}/payments/getTotalPayments`

export const ROLE_SHOW_API = `${baseURL}/role`
export const ROLE_UPDATE_API = `${baseURL}/role`

export const SEND_TASK_TO_TERMINAL_API = `${baseURL}/apparats/task/sendTask`
export const GET_TERMINAL_CONNECTION_STATUS_API = `${baseURL}/apparats/logs/getTerminalConnectionStatus`
export const FIND_TERMINAL_PAYMENT_LOGS_API = `${baseURL}/apparats/logs/findPay`
export const DOWNLOAD_TERMINAL_PAYMENT_LOGS_API = `${baseURL}/apparats/logs/downloadLogs`


export const GET_TERMINALS_LIST_API = `${baseURL}/apparats/reRegistration/getTerminalsList`
export const GET_UNREGISTERED_TERMINALS_LIST_BY_DEALER_API = `${baseURL}/apparats/reRegistration/getUnregisteredTerminalsList`
export const ADD_TO_TERMINAL_RE_REGISTRATION_QUEUE_API = `${baseURL}/apparats/reRegistration/addToQueue`
export const CHANGE_STATUS_RE_REGISTERED_TERMINAL_RECORD_API = `${baseURL}/apparats/reRegistration/changeRecordStatus`

export const GET_XML_CERTIFICATES_LIST_API = `${baseURL}/apparats/certificate/getListCertificates`
export const GET_XML_POINTS_LIST_API = `${baseURL}/apparats/certificate/getXmlPointsList`
export const GET_XML_CERTIFICATE_INFO_API = `${baseURL}/apparats/certificate/getCertificateInfo`
export const GENERATE_XML_CERTIFICATE_API = `${baseURL}/apparats/certificate/generate`
export const DOWNLOAD_XML_CERTIFICATE_API = `${baseURL}/apparats/certificate/download`

export const TEST_DATA_UTILS_CREATE_FILE_API = `${baseURL}/testZone/testDataUtils/createFile`
export const TEST_DATA_UTILS_READ_FILE_API = `${baseURL}/testZone/testDataUtils/readFile`
