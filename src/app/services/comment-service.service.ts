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


    getCommentsForPost(postSlug: string): Comment[] {
    const all = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return all.filter((c: Comment) => c.postSlug === postSlug);
  }

  addComment(comment: Comment): void {
    const all = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    all.push(comment);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }




}
