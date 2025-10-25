// src/app/app.config.ts

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// 1. Import the necessary provider function for HttpClient
import { provideHttpClient } from '@angular/common/http'; 

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // 2. FIX: Add provideHttpClient() to the providers array
    // This registers the HttpClient service globally for your standalone app.
    provideHttpClient() 
  ]
};