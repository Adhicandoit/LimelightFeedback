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
	private readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzh1Aqh0AmF3t4mAv5M0vaoaSyCl09mVuXDvRYVkMOeM-fDa24hUMKzzYJZoj0iRklR/exec';


	// Time_of_Visit is removed
	initialData = {
		NAME: '',
		OCCUPATION: '',
		DOB: '',
		WEDDING ANNIVERSARY: '',
		MOBILE NO.: '',
		EMAIL: '',
		ADDRESS: '', 
		
		DATE: '', 
		
		// Removed Food_Quality, Ambience, and Music
		HOSPITALITY: '', // Changed from 0 to '' (string rating)
		ATTENTION: '', // Changed from 0 to '' (string rating)
		TASTE: '', // Changed from 0 to '' (string rating)
		FOOD TEMPERATURE: '', // Changed from 0 to '' (string rating)
		FOOD PRESENTATION: '', // Changed from 0 to '' (string rating)
		DECOR: '', // Changed from 0 to '' (string rating)
		CLEANLINESS: '', // Changed from 0 to '' (string rating)

		HOW DID YOU LEARN ABOUT RATNAMOULI PALACE: '',
		DISHES YOU LIKED: '',
		DISHES YOU DISLIKED: '',
		ANY OTHER SUGGESTIONS: '',

		MANAGER VISIT: '', 
		RETURN TO RATNAMOULI PALACE: '', 
		
		TABLE NO.: '',
		STEWARD: '',
		MANAGER: ''
	};

	constructor(private fb: FormBuilder, private http: HttpClient) { }

	ngOnInit(): void {
		this.commentsForm = this.fb.group({
			// Personal & Visit Details
			'NAME': [this.initialData.NAME, Validators.required],
			'OCCUPATION': [this.initialData.OCCUPATION],
			'DOB': [this.initialData.DOB, Validators.required],
			'WEDDING ANNIVERSARY': [this.initialData['WEDDING ANNIVERSARY']],
			'MOBILE NO.': [this.initialData['MOBILE NO.'], Validators.required],
			'EMAIL': [this.initialData.EMAIL, Validators.email],
			'ADDRESS': [this.initialData.ADDRESS],	
			
			'DATE': [this.initialData.DATE, Validators.required],
			
			// Ratings
			'HOSPITALITY': [this.initialData.HOSPITALITY],
			'ATTENTION': [this.initialData.ATTENTION],
			'TASTE': [this.initialData.TASTE],
			'FOOD TEMPERATURE': [this.initialData['FOOD TEMPERATURE']],
			'FOOD PRESENTATION': [this.initialData['FOOD PRESENTATION']],
			'DECOR': [this.initialData.DECOR],
			'CLEANLINESS': [this.initialData.CLEANLINESS],

			// Open-ended/Specific Questions
			'HOW DID YOU LEARN ABOUT RATNAMOULI PALACE': [this.initialData['HOW DID YOU LEARN ABOUT RATNAMOULI PALACE']],
			'DISHES YOU LIKED': [this.initialData['DISHES YOU LIKED']],
			'DISHES YOU DISLIKED': [this.initialData['DISHES YOU DISLIKED']],	
			'ANY OTHER SUGGESTIONS': [this.initialData['ANY OTHER SUGGESTIONS']],

			// Yes/No
			'MANAGER VISIT': [this.initialData['MANAGER VISIT'], Validators.required],
			'RETURN TO RATNAMOULI PALACE': [this.initialData['RETURN TO RATNAMOULI PALACE'], Validators.required],
			
			// Footer fields
			'TABLE NO.': [this.initialData['TABLE NO.'], Validators.required],
			'STEWARD': [this.initialData.STEWARD, Validators.required],
			'MANAGER': [this.initialData.MANAGER, Validators.required]
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
