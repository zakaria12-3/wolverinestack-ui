import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService, PostDto } from '../../../core/services/post.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css']
})
export class Feed implements OnInit {
  posts: PostDto[] = [];
  newPostContent: string = '';
  isLoading: boolean = true;
  commentInputs: { [postId: number]: string } = {};

  constructor(private postService: PostService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load posts', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;

    this.postService.createPost(this.newPostContent).subscribe({
      next: (newPost) => {
        this.posts.unshift(newPost);
        this.newPostContent = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create post', err);
      }
    });
  }

  toggleLike(post: PostDto): void {
    if (!post.id) return;
    const wasLiked = post.likedByCurrentUser;

    // Optimistic UI update
    post.likedByCurrentUser = !wasLiked;
    if (post.likesCount !== undefined) {
       post.likesCount += wasLiked ? -1 : 1;
    }

    this.postService.toggleLike(post.id).subscribe({
      next: (updatedPost) => {
        // Sync with server if needed
        const index = this.posts.findIndex(p => p.id === updatedPost.id);
        if (index !== -1) {
          this.posts[index].likedByCurrentUser = updatedPost.likedByCurrentUser;
          this.posts[index].likesCount = updatedPost.likesCount;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Revert on error
        post.likedByCurrentUser = wasLiked;
        if (post.likesCount !== undefined) {
           post.likesCount += wasLiked ? 1 : -1;
        }
        console.error('Like failed', err);
        this.cdr.detectChanges();
      }
    });
  }

  addComment(post: PostDto): void {
    if (!post.id) return;
    const content = this.commentInputs[post.id];
    if (!content || !content.trim()) return;

    this.postService.addComment(post.id, content).subscribe({
      next: (updatedPost) => {
        // replace post with updated post containing new comment
        const index = this.posts.findIndex(p => p.id === updatedPost.id);
        if (index !== -1) {
          this.posts[index] = updatedPost;
        }
        this.commentInputs[post.id!] = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Add comment failed', err);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
