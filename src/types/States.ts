export interface StatesResponse {
    state_code: number;
    state_name_english: string;
    state_name_local: string;
    state_census2011_code: string;
    state_or_ut: string;
    last_updated: string;
}

export interface StateRecord {
    state_code: number;
    state_name_english: string;
    state_name_local: string;
    state_or_ut: string;
}
