import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { Post, PostService } from '../../../services/post.service';
import { CommentServiceService , Comment } from '../../../services/comment-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [FormsModule, CommonModule, MarkdownModule],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {
  post: Post | null = null;
  readingTime: number = 0;
  isLoading: boolean = false;
  error: string | null = null;


  views: number = 0;


  comments: Comment[] = [];
  newCommentAuthor = '';
  newCommentContent = '';



  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentServiceService

  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      const slug = this.route.snapshot.paramMap.get('slug');

      if (!slug) {
        this.error = 'No post slug provided';
        this.isLoading = false;
        return;
      }

      const posts = await this.postService.getAllPosts();


     if (this.post) {
        this.postService.incrementPostViews(slug);
        this.views = this.postService.getPostViews(slug);
        this.comments = this.commentService.getCommentsForPost(slug);

      }

      
      this.post = posts.find(p => p.slug === slug) || null;

      if (this.post && this.post.content) {
        const cleanContent = this.post.content
          .replace(/[\s\S]*?/g, '') 
          .replace(/!\[.*?\]\(.*?\)/g, '') 
          .replace(/\[.*?\]\(.*?\)/g, '')
          .replace(/[#*>\-]/g, '');

        const words = cleanContent.trim().split(/\s+/).filter(word => word.length > 0).length;
        this.readingTime = words > 0 ? Math.ceil(words / 200) : 1; // Minimum 1 minute
      } else {
        this.error = this.post ? 'Post content is empty' : 'Post not found';
      }
    } catch (error) {
      this.error = 'Failed to load post';
      console.error('Error loading post:', error);
    } finally {
      this.isLoading = false;
    }




  }


    addComment() {
    if (!this.newCommentAuthor.trim() || !this.newCommentContent.trim()) return;

    const comment: Comment = {
      postSlug: this.post!.slug,
      author: this.newCommentAuthor.trim(),
      content: this.newCommentContent.trim(),
      date: new Date().toISOString()
    };
    this.commentService.addComment(comment);
    this.comments.push(comment);
    this.newCommentAuthor = '';
    this.newCommentContent = '';
  }




  


}