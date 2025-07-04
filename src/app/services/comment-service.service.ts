import { Injectable } from '@angular/core';
export interface Comment {
  postSlug: string;
  author: string;
  content: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentServiceService {
    private storageKey = 'blogComments';
  constructor() { }
  // Get Post Comments
    getCommentsForPost(postSlug: string): Comment[] {
    const allComments: Comment[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return allComments.filter(comment => comment.postSlug === postSlug);
  }

  // Add new comments
    addComment(comment: Comment): void {
    const allComments: Comment[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    allComments.push(comment);
    localStorage.setItem(this.storageKey, JSON.stringify(allComments));
  }
}
