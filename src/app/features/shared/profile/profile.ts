import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  profile: UserProfile = {};
  isEditing = false;
  isLoading = true;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        try {
          if (!data) {
            console.warn('Received empty profile data');
            this.isLoading = false;
            this.cd.detectChanges();
            return;
          }
          
          this.profile = {
            id: data.id,
            username: data.username || data.email,
            email: data.email,
            bio: data.bio || '',
            headline: data.headline || '',
            location: data.location || '',
            avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          };
        } catch (e) {
          console.error('Error parsing profile data', e);
        } finally {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // User cancelled
      this.loadProfile(); 
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    this.userService.updateProfile(this.profile).subscribe({
      next: (data) => {
        this.profile = data;
        if (!this.profile.avatarUrl) {
           this.profile.avatarUrl = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
        }
        this.isEditing = false;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }
}
