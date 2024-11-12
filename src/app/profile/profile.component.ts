import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="profile-container">
      <h2>User Profile</h2>
      <p>This is the user profile page. You can add more details here.</p>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
    }
  `]
})
export class ProfileComponent {}