import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = true;
  showForm: boolean = false;
  newUser = { email: '', name: '' };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsers()
      .then((res: any) => {
        this.users = res.data;
        this.loading = false;
      })
      .catch(err => {
        console.error('Error loading users:', err);
        this.loading = false;
      });
  }

  createUser() {
    if (this.newUser.email && this.newUser.name) {
      this.apiService.createUser(this.newUser)
        .then(() => {
          this.newUser = { email: '', name: '' };
          this.showForm = false;
          this.loadUsers();
        })
        .catch(err => console.error('Error creating user:', err));
    }
  }
}
