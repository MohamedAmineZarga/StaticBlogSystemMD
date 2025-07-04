import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService, Post } from '../../../services/post.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit {
  // Necessary variables used in HTML page
  searchQuery = '';
  posts: Post[] = [];
  isLoading = false;
  filteredPosts: Post[] = [];
  selectedTags: string[] = [];
  selectedAuthor = '';
  dateFrom?: string;
  dateTo?: string;
  allTags: string[] = [];
  allAuthors: string[] = [];
  selectedFilterType: string = '';
  // Default constructor
  constructor(private postService: PostService) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      this.posts = await this.postService.getAllPosts();
      console.log('posts loaded', this.posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      this.isLoading = false;
    }


 this.extractTagsAndAuthors();
  this.applyFilters();
  }
    extractTagsAndAuthors() {
    const tagSet = new Set<string>();
    const authorSet = new Set<string>();
    this.posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
      if (post.author) authorSet.add(post.author);
    });
    this.allTags = Array.from(tagSet);
    this.allAuthors = Array.from(authorSet);
  }


  // Clear Filter inputs
clearFilterInputs() {
  this.selectedTags = [];
  this.selectedAuthor = '';
  this.dateFrom = undefined;
  this.dateTo = undefined;
}

// Apply Filters
   applyFilters() {
  let filtered = [...this.posts];
  if (this.searchQuery.trim()) {
    const q = this.searchQuery.toLowerCase();
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q) ||
      post.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
  if (this.selectedFilterType === 'tags' && this.selectedTags.length > 0) {
    filtered = filtered.filter(post =>
      this.selectedTags.every(tag => post.tags.includes(tag))
    );
  }
  if (this.selectedFilterType === 'author' && this.selectedAuthor) {
    filtered = filtered.filter(post => post.author === this.selectedAuthor);
  }
  if (this.selectedFilterType === 'date') {
    if (this.dateFrom) {
      filtered = filtered.filter(post =>
        new Date(post.date) >= new Date(this.dateFrom!)
      );
    }
    if (this.dateTo) {
      filtered = filtered.filter(post =>
        new Date(post.date) <= new Date(this.dateTo!)
      );
    }
  }
  this.filteredPosts = filtered;
}

// Apply Search changes
async onSearchChange() {
  this.isLoading = true;
  this.posts = await this.postService.searchPosts(this.searchQuery);
  this.isLoading = false;
}

 // More posts loader
  async loadMore(): Promise<void> {
    if (this.hasMore() && !this.isLoading) {
      this.isLoading = true;
      try {
        this.posts = await this.postService.loadMorePosts();
      } catch (error) {
        console.error('Error loading more posts:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  hasMore(): boolean {
    return this.postService.hasMore();
  }


// DOWNLOAD RSS XML FILE 
  downloadRss() {
  this.postService.getAllPosts().then(posts => {
    const rssXml = this.postService.generateRss(posts);
    const blob = new Blob([rssXml], { type: 'application/rss+xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rss.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  });
}


}
