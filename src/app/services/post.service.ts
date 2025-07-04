import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import frontMatter from 'front-matter';
import { lastValueFrom } from 'rxjs'; 
import matter from 'gray-matter';


interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
  cover?: string; 
  author?: string;
}


export interface GitHubFileContent {
  name: string;
  path: string;
  type: string;
  download_url: string;
}


export interface Post {

  title: string;
  date: string;
  tags: string[];
  cover: string;
  author: string;
  content: string; 
  readingTime?: number; 
  excerpt: string;
  slug: string;
  source: 'local' | 'github'; 

    views?: number;


}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private localPostsFiles = ['post1.md'];
  private pageSize = 10; 
  private loadedPosts: Post[] = [];
  private hasMorePosts = true;

  


  constructor(private http: HttpClient) {}


  //GITHUB
private githubRepo = 'MohamedAmineZarga/my-blog-posts';
private githubBranch = 'main';
private githubPostFolder = 'posts';






 private async loadFromGitHub(): Promise<Post[]> {
  const apiUrl = `https://api.github.com/repos/${this.githubRepo}/contents/${this.githubPostFolder}?ref=${this.githubBranch}`;

  try {
    const files = await this.http.get<GitHubFileContent[]>(apiUrl).toPromise();

    if (!Array.isArray(files)) {
      console.error('GitHub API response is not an array');
      return [];
    }

    const markdownFiles = files.filter(file =>
      file.name.endsWith('.md') &&
      file.type === 'file' &&
      !!file.download_url
    );

    const posts = await Promise.all(
      markdownFiles.map(async file => {
        try {
          const content = await this.http
            .get(file.download_url, { responseType: 'text' })
            .toPromise();

          if (typeof content !== 'string') {
            throw new Error(`Expected string content for ${file.name}`);
          }

          return this.parseMarkdown(content, file.name.replace('.md', ''));
        } catch (err) {
          console.error(`Error parsing ${file.name}:`, err);
          return null;
        }
      })
    );

    return posts.filter((post): post is Post => post !== null);
  } catch (err) {
    console.error('Failed to load from GitHub:', err);
    return [];
  }
}


  private parseMarkdown(content: string, slug: string): Post {
  try {
    const parsed = frontMatter<PostMeta>(content);
    const data = parsed.attributes;
    const body = parsed.body.trim();

    const words = body.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    return {
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      cover: data.cover || '',
      author: data.author || '',
      content: body,
      excerpt: body.slice(0, 200) + '...',
      slug,
      source: 'github',
      readingTime
     
    };
  } catch (error) {
    console.error('Markdown parse error:', error);
    return {
      title: 'Invalid Post',
      date: new Date().toISOString(),
      tags: [],
      cover: '',
      author: '',
      content: '',
      excerpt: '',
      slug,
      source: 'github',
      readingTime: 0
    };
  }
}

  private async fetchPosts(start: number, limit: number): Promise<Post[]> {
    try {
      const posts = await Promise.all(
        this.localPostsFiles
          .slice(start, start + limit)
          .map(async (file) => {
            const filePath = `assets/posts/${file}`;
            const content = await lastValueFrom(
              this.http.get(filePath, { responseType: 'text' })
            );

            const parsed = frontMatter<PostMeta>(content || ''); 
            const data = parsed.attributes; 

            const slug = file.replace(/\.md$/, '');

            const localPost: Post = {
              title: data.title,
              date: data.date,
              tags: data.tags || [],
              cover: data.cover || '',
              author: data.author || '',
              content: parsed.body, 
              excerpt: parsed.body.slice(0, 200) + '...', 
              slug: slug,
              source: 'local',
              
            };
            return localPost;
          })
      );
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  async getAllLocalPosts(): Promise<Post[]> {
    try {
      if (this.localPostsFiles.length <= this.pageSize) {
        const posts = await this.fetchPosts(0, this.localPostsFiles.length);
        this.loadedPosts = posts;
        this.hasMorePosts = false;
        return posts;
      } else {
        if (this.loadedPosts.length === 0) {
          const posts = await this.fetchPosts(0, this.pageSize);
          this.loadedPosts = posts;
        }
        return this.loadedPosts;
      }
    } catch (error) {
      console.error('Error in getAllLocalPosts:', error);
      return [];
    }
  }

  async loadMorePosts(): Promise<Post[]> {
    if (!this.hasMorePosts) {
      return this.loadedPosts;
    }

    try {
      const start = this.loadedPosts.length;
      const posts = await this.fetchPosts(start, this.pageSize);
      
      this.loadedPosts = [...this.loadedPosts, ...posts];
      this.hasMorePosts = this.loadedPosts.length < this.localPostsFiles.length;
      
      return this.loadedPosts;
    } catch (error) {
      console.error('Error loading more posts:', error);
      return this.loadedPosts;
    }
  }
async getAllPosts(): Promise<Post[]> {
  const localPosts = await this.getAllLocalPosts();
  const githubPosts = await this.loadFromGitHub();

  const allPosts = [...localPosts, ...githubPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return allPosts;
}



async searchPosts(query: string): Promise<Post[]> {
  const allPosts = await this.getAllPosts();
  const lowerQuery = query.trim().toLowerCase();

  if (!lowerQuery) {
    return allPosts;
  }

  return allPosts.filter(post => {
    if (post.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    if (post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true;
    }

    if (post.author.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    if (post.excerpt.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  });
}




  hasMore(): boolean {
    return this.hasMorePosts;
  }





  filterByTags(posts: Post[], selectedTags: string[]): Post[] {
    if (!selectedTags || selectedTags.length === 0) return posts;
    const lowerTags = selectedTags.map(t => t.toLowerCase());
    return posts.filter(post =>
      post.tags.some(tag => lowerTags.includes(tag.toLowerCase()))
    );
  }





    filterByAuthor(posts: Post[], authorQuery: string): Post[] {
    if (!authorQuery || authorQuery.trim() === '') return posts;
    const q = authorQuery.trim().toLowerCase();
    return posts.filter(post =>
      post.author.toLowerCase().includes(q)
    );
  }





    filterByDateRange(posts: Post[], fromDate?: string, toDate?: string): Post[] {
    if (!fromDate && !toDate) return posts;

    const from = fromDate ? new Date(fromDate) : new Date('1970-01-01');
    const to = toDate ? new Date(toDate) : new Date();

    return posts.filter(post => {
      const postDate = new Date(post.date);
      return postDate >= from && postDate <= to;
    });
  }





    applyFilters(
    posts: Post[],
    selectedTags: string[],
    authorQuery: string,
    fromDate?: string,
    toDate?: string
  ): Post[] {




    
    let filtered = posts;
    filtered = this.filterByTags(filtered, selectedTags);
    filtered = this.filterByAuthor(filtered, authorQuery);
    filtered = this.filterByDateRange(filtered, fromDate, toDate);
    return filtered;




  }

  

  getPostViews(slug: string): number {
  const views = localStorage.getItem(`post-views-${slug}`);
  return views ? +views : 0;
}

incrementPostViews(slug: string): void {
  const current = this.getPostViews(slug);
  localStorage.setItem(`post-views-${slug}`, (current + 1).toString());
}


generateRss(posts: Post[]): string {
  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <author><![CDATA[${post.author}]]></author>
    </item>
  `).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>MY BLOG </title>
      <description>MED AMINE ZARGA BLOG</description>
      <language>en-us</language>
      ${rssItems}
    </channel>
  </rss>`;

  return rssFeed;
}

  
}