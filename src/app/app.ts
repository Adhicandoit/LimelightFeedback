import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { CommonModule } from '@angular/common';

// --- FIX: Define an interface to explicitly declare keys with spaces ---
interface FeedbackFormKeys {
    'NAME': string;
    'OCCUPATION': string;
    'DOB': string;
    'WEDDING ANNIVERSARY': string;
    'MOBILE NO.': string;
    'EMAIL': string;
    'ADDRESS': string;	
    'DATE': string;	
    'HOSPITALITY': string; 
    'ATTENTION': string; 
    'TASTE': string; 
    'FOOD TEMPERATURE': string;
    'FOOD PRESENTATION': string; 
    'DECOR': string; 
    'CLEANLINESS': string; 
    'HOW DID YOU LEARN ABOUT RATNAMOULI PALACE': string;
    'DISHES YOU LIKED': string;
    'DISHES YOU DISLIKED': string;
    'ANY OTHER SUGGESTIONS': string;
    'MANAGER VISIT': string;	
    'RETURN TO RATNAMOULI PALACE': string;	
    'TABLE NO.': string;
    'STEWARD': string;
    'MANAGER': string;
}

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
	private readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxFPbQZZSwugR7lT8Mp2yWu08kGEIfKbgDrNXyw7GNeQLsosFIobUOv74ShVcxTZtN/exec';


	// Apply the new interface and explicitly cast the object literal to ensure strict typing of keys.
	// This cast resolves the TS7053 errors.
	initialData: FeedbackFormKeys = {
		'NAME': '', // <-- Keys with spaces and uppercase
		'OCCUPATION': '',
		'DOB': '',
		'WEDDING ANNIVERSARY': '',
		'MOBILE NO.': '',
		'EMAIL': '',
		'ADDRESS': '',	
		
		'DATE': '',	
		
		// Ratings 
		'HOSPITALITY': '', 
		'ATTENTION': '', 
		'TASTE': '', 
		'FOOD TEMPERATURE': '',
		'FOOD PRESENTATION': '', 
		'DECOR': '', 
		'CLEANLINESS': '', 

		'HOW DID YOU LEARN ABOUT RATNAMOULI PALACE': '',
		'DISHES YOU LIKED': '',
		'DISHES YOU DISLIKED': '',
		'ANY OTHER SUGGESTIONS': '',

		'MANAGER VISIT': '',	
		'RETURN TO RATNAMOULI PALACE': '',	
		
		'TABLE NO.': '',
		'STEWARD': '',
		'MANAGER': ''
	} as FeedbackFormKeys; // <-- The critical fix applied here

	constructor(private fb: FormBuilder, private http: HttpClient) { }

	ngOnInit(): void {
		this.commentsForm = this.fb.group({
			// Using bracket notation and accessing initialData values
			
			// Personal & Visit Details
			'NAME': [this.initialData['NAME'], Validators.required],
			'OCCUPATION': [this.initialData['OCCUPATION']],
			'DOB': [this.initialData['DOB'], Validators.required],
			'WEDDING ANNIVERSARY': [this.initialData['WEDDING ANNIVERSARY']],
			'MOBILE NO.': [this.initialData['MOBILE NO.'], Validators.required],
			'EMAIL': [this.initialData['EMAIL'], Validators.email],
			'ADDRESS': [this.initialData['ADDRESS']],	
			
			'DATE': [this.initialData['DATE'], Validators.required],
			
			// Ratings
			'HOSPITALITY': [this.initialData['HOSPITALITY']],
			'ATTENTION': [this.initialData['ATTENTION']],
			'TASTE': [this.initialData['TASTE']],
			'FOOD TEMPERATURE': [this.initialData['FOOD TEMPERATURE']],
			'FOOD PRESENTATION': [this.initialData['FOOD PRESENTATION']],
			'DECOR': [this.initialData['DECOR']],
			'CLEANLINESS': [this.initialData['CLEANLINESS']],

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
			'STEWARD': [this.initialData['STEWARD'], Validators.required],
			'MANAGER': [this.initialData['MANAGER'], Validators.required]
		});
	}
    
	onSubmit(): void {
		if (this.commentsForm.invalid) {
			this.commentsForm.markAllAsTouched();
			this.submissionStatus = 'validation_error';
			return;
		}

		this.submissionStatus = 'submitting';
		
		const formData = this.commentsForm.value;
		
		const body = new URLSearchParams();
		body.set('data', JSON.stringify(formData));
		
		const headers = new HttpHeaders({	
			'Content-Type': 'application/x-www-form-urlencoded'	
		});
		
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
