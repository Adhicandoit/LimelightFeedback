import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Added HttpHeaders for clarity
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    CommonModule,        
    ReactiveFormsModule  
  ],
  standalone: true, 
  
  styleUrls: ['./app.scss'] 
})
export class App implements OnInit {
  
  commentsForm!: FormGroup;
  submissionStatus: 'initial' | 'submitting' | 'success' | 'server_error' | 'validation_error' = 'initial'; 
  public V = Validators; 

  // !!! REPLACE THIS WITH YOUR DEPLOYED APPS SCRIPT WEB APP URL !!!
  // NOTE: Ensure this is the /exec URL, not the /dev URL.
  private readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyl5cKShfcLj4NSe5vDtOyPFLL4S3yfDh-wpll2L0Mi6LA2RWYjdnvqTYDu0AyyWH2B/exec';

  // Time_of_Visit is removed
  initialData = {
    Name: '',
    Occupation: '',
    Date_of_Birth: '',
    Wedding_Anniversary: '',
    Contact_Number: '',
    Email: '',
    Address: '', 
    
    Date_of_Visit: '', 
    
    Hospitality: 0, 
    Attention: 0,
    Food_Quality: 0, 
    Taste: 0,
    Food_Temperature: 0,
    Food_Presentation: 0,
    Ambience: 0,
    Decor: 0,        
    Cleanliness: 0,
    Music: 0,

    How_Did_You_Hear: '',
    Dishes_Liked: '',
    Dishes_Disliked: '',
    Any_Suggestions: '',

    Manager_Visit: '', 
    Return_to_Palace: '', 
    
    Table_No: '',
    Steward: '',
    Manager: ''
  };

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.commentsForm = this.fb.group({
      // Personal & Visit Details
      Name: [this.initialData.Name, Validators.required],
      Occupation: [this.initialData.Occupation],
      Date_of_Birth: [this.initialData.Date_of_Birth],
      Wedding_Anniversary: [this.initialData.Wedding_Anniversary],
      Contact_Number: [this.initialData.Contact_Number],
      Email: [this.initialData.Email, Validators.email],
      Address: [this.initialData.Address], 
      
      Date_of_Visit: [this.initialData.Date_of_Visit, Validators.required],
      
      // Ratings
      Hospitality: [this.initialData.Hospitality],
      Attention: [this.initialData.Attention],
      Food_Quality: [this.initialData.Food_Quality],
      Taste: [this.initialData.Taste],
      Food_Temperature: [this.initialData.Food_Temperature],
      Food_Presentation: [this.initialData.Food_Presentation],
      Ambience: [this.initialData.Ambience],
      Decor: [this.initialData.Decor],
      Cleanliness: [this.initialData.Cleanliness],
      Music: [this.initialData.Music],

      // Open-ended/Specific Questions
      How_Did_You_Hear: [this.initialData.How_Did_You_Hear],
      Dishes_Liked: [this.initialData.Dishes_Liked],
      Dishes_Disliked: [this.initialData.Dishes_Disliked], 
      Any_Suggestions: [this.initialData.Any_Suggestions],

      // Yes/No
      Manager_Visit: [this.initialData.Manager_Visit, Validators.required],
      Return_to_Palace: [this.initialData.Return_to_Palace, Validators.required],
      
      // Footer fields
      Table_No: [this.initialData.Table_No],
      Steward: [this.initialData.Steward],
      Manager: [this.initialData.Manager]
    });
  }

  onSubmit(): void {
    if (this.commentsForm.invalid) {
      this.commentsForm.markAllAsTouched();
      this.submissionStatus = 'validation_error';
      return;
    }

    this.submissionStatus = 'submitting';
    
    // --- 💥 CRITICAL CHANGE: Format data for Apps Script ---
    // Apps Script is much happier with application/x-www-form-urlencoded format
    // However, to get the robustness of the doPost(e) function which uses e.postData.contents,
    // we will keep sending a JSON string, but we will simplify the HTTP configuration
    // and append a callback parameter to force a cleaner response path.
    
    const formData = this.commentsForm.value;
    
    // We will use a URLSearchParams approach to package the JSON string under a single key,
    // which often resolves deep-seated CORS/preflight issues with Apps Script.
    
    const body = new URLSearchParams();
    body.set('data', JSON.stringify(formData));
    
    // This ensures the request doesn't trigger a CORS preflight, which is likely being blocked.
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/x-www-form-urlencoded' 
    });

    // We MUST use the /exec endpoint. The Apps Script doPost needs to be modified 
    // to use e.parameter.data when using URLSearchParams (next step).
    
    this.http.post(this.SCRIPT_URL, body.toString(), { headers }).subscribe({
      next: (response) => {
        console.log('Submission Success:', response);
        this.submissionStatus = 'success';
        this.commentsForm.reset(this.initialData);
      },
      error: (error) => {
        console.error('Submission Error:', error);
        this.submissionStatus = 'server_error';
      }
    });
  }
};
