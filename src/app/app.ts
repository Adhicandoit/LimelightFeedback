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

<<<<<<< HEAD
	// !!! REPLACE THIS WITH YOUR DEPLOYED APPS SCRIPT WEB APP URL !!!
	// NOTE: Ensure this is the /exec URL, not the /dev URL.
	private readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3F-ilsQwhbG1ZuNtS_W6bHgL5rz-Y4DQUa6dSlc8hxLmnO1rflx_roUmtdMwP5R69/exec';
=======
  // !!! REPLACE THIS WITH YOUR DEPLOYED APPS SCRIPT WEB APP URL !!!
  // NOTE: Ensure this is the /exec URL, not the /dev URL.
  private readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynJ7iHyJDaYByE3hLGXwRNGe3VwlxKGHJlkHbo8CKIn5_RyC-tE29FrC4Do92Y-uaD/exec';
>>>>>>> 4fc1fa01c8e7b338d258fca2e24c9c31deafb15c

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
		
		// Removed Food_Quality, Ambience, and Music
		Hospitality: '', // Changed from 0 to '' (string rating)
		Attention: '', // Changed from 0 to '' (string rating)
		Taste: '', // Changed from 0 to '' (string rating)
		Food_Temperature: '', // Changed from 0 to '' (string rating)
		Food_Presentation: '', // Changed from 0 to '' (string rating)
		Decor: '', // Changed from 0 to '' (string rating)
		Cleanliness: '', // Changed from 0 to '' (string rating)

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
			Date_of_Birth: [this.initialData.Date_of_Birth, Validators.required],
			Wedding_Anniversary: [this.initialData.Wedding_Anniversary],
			Contact_Number: [this.initialData.Contact_Number, Validators.required],
			Email: [this.initialData.Email, Validators.email],
			Address: [this.initialData.Address], 
			
			Date_of_Visit: [this.initialData.Date_of_Visit, Validators.required],
			
			// Ratings (Fields removed: Food_Quality, Ambience, Music)
			Hospitality: [this.initialData.Hospitality],
			Attention: [this.initialData.Attention],
			Taste: [this.initialData.Taste],
			Food_Temperature: [this.initialData.Food_Temperature],
			Food_Presentation: [this.initialData.Food_Presentation],
			Decor: [this.initialData.Decor],
			Cleanliness: [this.initialData.Cleanliness],

			// Open-ended/Specific Questions
			How_Did_You_Hear: [this.initialData.How_Did_You_Hear],
			Dishes_Liked: [this.initialData.Dishes_Liked],
			Dishes_Disliked: [this.initialData.Dishes_Disliked], 
			Any_Suggestions: [this.initialData.Any_Suggestions],

			// Yes/No
			Manager_Visit: [this.initialData.Manager_Visit, Validators.required],
			Return_to_Palace: [this.initialData.Return_to_Palace, Validators.required],
			
			// Footer fields
			Table_No: [this.initialData.Table_No, Validators.required],
			Steward: [this.initialData.Steward, Validators.required],
			Manager: [this.initialData.Manager, Validators.required]
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