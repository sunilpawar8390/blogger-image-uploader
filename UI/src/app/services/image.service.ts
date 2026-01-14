import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ProcessResponse {
  imageUrl: string;
  originalImage: string;
  blogId: string;
}

export interface ProcessRequest {
  postUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = '/api/process';

  constructor(private http: HttpClient) { }

  processPost(postUrl: string): Observable<ProcessResponse> {
    const request: ProcessRequest = { postUrl };

    return this.http.post<ProcessResponse>(this.apiUrl, request).pipe(
      catchError(error => {
        let errorMessage = 'An error occurred while processing your request';

        if (error.status === 400) {
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