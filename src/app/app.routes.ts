import { Routes } from '@angular/router';
import { BlogListComponent } from './components/blog/blog-list/blog-list.component';
import { BlogPostComponent } from './components/blog/blog-post/blog-post.component';

export const routes: Routes = [
{path:'', component: BlogListComponent},
{path: 'post/:slug' , component: BlogPostComponent}


    
];
