import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProcessResponse {
  imageUrl: string;
  originalImage: string;
  blogId?: string;
  filename?: string;
  fileId?: string;
  success?: boolean;
}

export interface ProcessRequest {
  postUrl: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  processPost(postUrl: string): Observable<ProcessResponse> {
    const request: ProcessRequest = {
      postUrl,
      password: environment.apiPassword
    };

    return this.http.post<ProcessResponse>(this.apiUrl, request).pipe(
      catchError(error => {
        let errorMessage = 'An error occurred while processing your request';

        if (error.status === 401) {
          errorMessage = 'Authentication failed. Invalid API password.';
        } else if (error.status === 400) {
          errorMessage = error.error?.error || 'Invalid request';
        } else if (error.status === 404) {
          errorMessage = error.error?.error || 'No images found in the post';
        } else if (error.status === 500) {
          errorMessage = error.error?.error || 'Server error occurred';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}