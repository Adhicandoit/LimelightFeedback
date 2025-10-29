// src/app/app.component.ts (Modified)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DataTransferService } from '../service/DataTransfer.service';// Import the new service
import { StaffDetailsComponent } from '../sttaff-details/sttaff-details';// Corrected import to use StaffDetailsComponent

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    // We now include the new component here
    imports: [
        CommonModule, 
        ReactiveFormsModule,
        HttpClientModule, // Added missing HttpClientModule
        StaffDetailsComponent // Include the second page component
    ],
    standalone: true, 
    styleUrls: ['./app.scss'] 
})
export class App implements OnInit {
    
    commentsForm!: FormGroup;
    // We change submissionStatus to control view flow
    submissionStatus: 'initial' | 'saving' | 'proceeded' | 'validation_error' = 'initial'; 
    public V = Validators; 
    
    // Flag to control which page is visible (simulating routing)
    showPage1: boolean = true;
    showLoader: boolean = false;


    initialData = {
        Name: '',
        Occupation: '',
        Date_of_Birth: '',
        Wedding_Anniversary: '',
        Contact_Number: '',
        Email: '',
        Address: '', 
        
        Date_of_Visit: '', 
        
        Hospitality: '',
        Attention: '',
        Taste: '',
        Food_Temperature: '',
        Food_Presentation: '',
        Decor: '',
        Cleanliness: '',

        How_Did_You_Hear: '',
        Dishes_Liked: '',
        Dishes_Disliked: '',
        Any_Suggestions: '',

        Manager_Visit: '', 
        Return_to_Palace: '', 
        
        // !!! Removed Table_No, Steward, Manager from initialData Page 1 !!!
    };

    constructor(
        private fb: FormBuilder, 
        private http: HttpClient,
        private dataTransfer: DataTransferService // Inject service
    ) { }

    ngOnInit(): void {
        this.commentsForm = this.fb.group({
            // Personal & Visit Details (Kept the same)
            Name: [this.initialData.Name, Validators.required],
            Occupation: [this.initialData.Occupation],
            Date_of_Birth: [this.initialData.Date_of_Birth, Validators.required],
            Wedding_Anniversary: [this.initialData.Wedding_Anniversary],
            Contact_Number: [this.initialData.Contact_Number, Validators.required],
            Email: [this.initialData.Email, Validators.email],
            Address: [this.initialData.Address], 
            
            Date_of_Visit: [this.initialData.Date_of_Visit, Validators.required],
            
            // Ratings (Kept the same)
            Hospitality: [this.initialData.Hospitality],
            Attention: [this.initialData.Attention],
            Taste: [this.initialData.Taste],
            Food_Temperature: [this.initialData.Food_Temperature],
            Food_Presentation: [this.initialData.Food_Presentation],
            Decor: [this.initialData.Decor],
            Cleanliness: [this.initialData.Cleanliness],

            // Open-ended/Specific Questions (Kept the same)
            How_Did_You_Hear: [this.initialData.How_Did_You_Hear],
            Dishes_Liked: [this.initialData.Dishes_Liked],
            Dishes_Disliked: [this.initialData.Dishes_Disliked], 
            Any_Suggestions: [this.initialData.Any_Suggestions],

            // Yes/No (Kept the same)
            Manager_Visit: [this.initialData.Manager_Visit, Validators.required],
            Return_to_Palace: [this.initialData.Return_to_Palace, Validators.required],
            
            // !!! Removed Table_No, Steward, Manager from Form Group Page 1 !!!
        });
    }

    // Renamed from onSubmit to onProceed for clarity
    onProceed(): void {
        if (this.commentsForm.invalid) {
            this.commentsForm.markAllAsTouched();
            this.submissionStatus = 'validation_error';
            return;
        }

        this.submissionStatus = 'saving';
        this.showLoader = true; // Show the professional loader
        
        // 1. Save guest data to the service
        const guestData = this.commentsForm.value;
        this.dataTransfer.setGuestData(guestData);

        // 2. Simulate saving/loading time and then navigate
        setTimeout(() => {
            this.showLoader = false; // Hide loader
            this.showPage1 = false;  // Navigate to Page 2 (showPage1 is false)
            this.submissionStatus = 'proceeded'; // Status for internal use
        }, 1500); // 1.5 second professional loading time
    }
    
    // METHOD TO RESET THE ENTIRE APPLICATION STATE after successful final submission
    handleSubmissionComplete(): void {
        // 1. Reset to Page 1
        this.showPage1 = true;
        
        // 2. Reset the Page 1 form and status for the next entry
        this.commentsForm.reset(); 
        this.commentsForm.markAsPristine();
        this.commentsForm.markAsUntouched();
        this.submissionStatus = 'initial';
        this.showLoader = false;

        // Reset specific select/dropdown fields if form.reset() doesn't clear them
        this.commentsForm.get('Hospitality')?.setValue('');
        this.commentsForm.get('Attention')?.setValue('');
        this.commentsForm.get('Taste')?.setValue('');
        this.commentsForm.get('Food_Temperature')?.setValue('');
        this.commentsForm.get('Food_Presentation')?.setValue('');
        this.commentsForm.get('Decor')?.setValue('');
        this.commentsForm.get('Cleanliness')?.setValue('');
        this.commentsForm.get('How_Did_You_Hear')?.setValue('');
        this.commentsForm.get('Manager_Visit')?.setValue('');
        this.commentsForm.get('Return_to_Palace')?.setValue('');

        console.log('Application reset successful. Ready for new entry.');
    }

    // Utility to check if a control has errors
    hasError(controlName: string, errorType: string): boolean {
      const control = this.commentsForm.get(controlName);
      return !!control && control.touched && control.hasError(errorType);
    }
}
