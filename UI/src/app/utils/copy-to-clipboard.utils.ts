import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class CopyToClipboardService {
  constructor(private toastr: ToastrService) { }

  copyToClipboard(text: string): void {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.toastr.success('URL copied to clipboard!');
      } catch (err) {
        this.toastr.error('Failed to copy URL');
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        this.toastr.success('URL copied to clipboard!');
      },
      (err) => {
        this.toastr.error('Failed to copy URL');
      }
    );
  }
}