// src/app/data-transfer.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  // Store the data collected from the first page
  private guestData: any = {};

  setGuestData(data: any) {
    this.guestData = data;
    console.log('Guest Data Saved:', this.guestData);
  }

  getGuestData(): any {
    return this.guestData;
  }

  // Clear data after successful final submission
  clearData() {
    this.guestData = {};
  }
}