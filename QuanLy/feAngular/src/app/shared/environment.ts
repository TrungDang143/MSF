import { HttpHeaders } from "@angular/common/http";

export const environment = {
    baseUrl: 'https://localhost:7119/api/',
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  