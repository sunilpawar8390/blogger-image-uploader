import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ImageService, ProcessResponse } from '../../services/image.service';
import { CopyToClipboardService } from '../../utils/copy-to-clipboard.utils';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent {
  form: FormGroup;
  isLoading = false;
  result: ProcessResponse | null = null;
  error: string | null = null;
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    private imageService: ImageService,
    private copyService: CopyToClipboardService
  ) {
    this.form = this.fb.group({
      postUrl: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/)
      ]]
    });
  }

  get postUrl() {
    return this.form.get('postUrl');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.result = null;
    this.showPreview = false;

    this.imageService.processPost(this.form.value.postUrl).pipe(
      catchError(error => {
        this.error = error.message;
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.result = response;
        this.showPreview = true;
      }
      this.isLoading = false;
    });
  }

  onCopyUrl(): void {
    if (this.result?.imageUrl) {
      this.copyService.copyToClipboard(this.result.imageUrl);
    }
  }

  onClear(): void {
    this.form.reset();
    this.result = null;
    this.error = null;
    this.showPreview = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}