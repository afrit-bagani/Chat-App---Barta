const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const HOST = BACKEND_URL;

// AUTH
const AUTH_ROUTE = `${BACKEND_URL}/auth`;
export const SIGN_UP_ROUTE = `${AUTH_ROUTE}/signup`;
export const SIGN_IN_ROUTE = `${AUTH_ROUTE}/signin`;
export const GET_USER_DATA_ROUTE = `${AUTH_ROUTE}/user-data`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTE}/profile`;
export const DELETE_PROFILE_PICTURE = `${AUTH_ROUTE}/profile`;
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;
export const VERIFY_EMAIL_ROUTE = `${AUTH_ROUTE}/verify-email`;

// CONTACT
const CONTACT_ROUTE = `${BACKEND_URL}/contacts`;
export const GET_ALL_CONTACTS = `${CONTACT_ROUTE}`;
export const SEARCH_CONTACT_ROUTE = `${CONTACT_ROUTE}/search`;
export const GET_DM_CONTACTS_ROUTE = `${CONTACT_ROUTE}/dm`;

// MESSAGE
const MESSAGE_ROUTE = `${BACKEND_URL}/messages`;
export const GET_ALL_MESSAGE_ROUTE = MESSAGE_ROUTE;
export const UPLOAD_FILE_ROUTE = `${MESSAGE_ROUTE}/file`;
