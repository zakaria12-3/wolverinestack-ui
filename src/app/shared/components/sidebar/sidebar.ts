import { Component } from '@angular/core';
import {HlmSidebarImports} from '@spartan-ng/helm/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {lucideCalendar, lucideHouse, lucideInbox, lucideSearch, lucideSettings} from '@ng-icons/lucide';
import {HlmIcon} from '@spartan-ng/helm/icon';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-sidebar',
  imports: [HlmSidebarImports, NgIcon, HlmIcon,RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone:true,
  providers: [
    provideIcons({
      lucideHouse,
      lucideInbox,
      lucideCalendar,
      lucideSearch,
      lucideSettings,
    }),
  ],
})
export class Sidebar {
  protected readonly _items = [
    {
      title: 'Home',
      url: '#',
      icon: 'lucideHouse',
      path:'',
    },
    {
      title: 'Inbox',
      url: '#',
      icon: 'lucideInbox',
    },
    {
      title: 'Calendar',
      path: '/c',
      icon: 'lucideCalendar',
    },
    {
      title: 'Search',
      url: '#',
      icon: 'lucideSearch',
    },
    {
      title: 'Settings',
      url: '#',
      icon: 'lucideSettings',
    },
  ];

}

