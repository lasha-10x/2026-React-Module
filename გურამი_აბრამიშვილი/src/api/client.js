import { API_BASE_URL } from "@/utils/constants";
import { ApiClient } from "./ApiClient";
export const api = new ApiClient(API_BASE_URL);
