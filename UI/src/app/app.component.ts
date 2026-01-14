import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    min-h-screen {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'Blogger Image Uploader';
}