import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CsvUploadService } from '../../services/csv/file-upload.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'my-form',
  templateUrl: './form.component.html',
})
export class FormComponent {
  name = 'Manipulation CSV';
  public userForm: FormGroup;
  file: File | null = null;
  message: string = '';
  downloadLink: string | null = null;
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private _fb: FormBuilder,
    private csvUploadService: CsvUploadService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialisation du formulaire principal
    this.userForm = this._fb.group({
      nameOutPut: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^(?!.*\d)(?!.*<\?php)(?!.*@)(?!.*%)[a-zA-ZÀ-ÿ]+([ '-][a-zA-ZÀ-ÿ]+)*$/),
        ],
      ],
      typeJoin: [''],
      address: this._fb.array([this.addAddressGroup()]),
    });
  }

  // Ajouter un nouveau groupe dans FormArray
  private addAddressGroup(): FormGroup {
    return this._fb.group({
      namefile: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^(?!.*\d)(?!.*<\?php)(?!.*@)(?!.*%)[a-zA-ZÀ-ÿ]+([ '-][a-zA-ZÀ-ÿ]+)*$/),
        ],
      ],
      file: [null, Validators.required],
    });
  }

  // Getter pour accéder au FormArray
  get addressArray(): FormArray {
    return this.userForm.get('address') as FormArray;
  }

  // Ajouter un nouveau groupe d'adresse
  addAddress(): void {
    this.addressArray.push(this.addAddressGroup());
  }

  // Supprimer un groupe d'adresse
  removeAddress(index: number): void {
    this.addressArray.removeAt(index);

    if (this.addressArray.length <= 1) {
      this.userForm.get('typeJoin')?.reset('');
      this.cdr.detectChanges(); // Force la détection des changements
    }
  }

  // Gérer le changement de fichier
  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.file = file;
      this.addressArray.controls[index].get('file')?.setValue(file);
    }
  }

  // Méthode pour récupérer toutes les valeurs de namefile
  getAllNameFileValues(): string[] {
    return this.addressArray.controls.map(control => control.get('namefile')?.value);
  }

  getAllFileValues(): File[] {
    return this.addressArray.controls.map(control => control.get('file')?.value);
  }

  // Méthode pour récupérer une seule valeur de namefile par index
  getNameFileValue(index: number): string | null {
    const control = this.addressArray.at(index).get('namefile');
    return control ? control.value : null;
  }

  // Soumettre le formulaire
  uploadFile(): void {
    const formData = new FormData();

    // Ajout des champs du formulaire
    formData.append('nameOutPut', this.userForm.get('nameOutPut')?.value);
    formData.append('typeJoin', this.userForm.get('typeJoin')?.value);

    // Ajout des fichiers et noms associés
    this.addressArray.controls.forEach((control, index) => {
      const file = control.get('file')?.value;
      const namefile = control.get('namefile')?.value;

      if (file && namefile) {
        formData.append('file', file, file.name); // Ajout des fichiers
        formData.append(`namefile[${index}]`, namefile); // Ajout des noms de fichiers
      }
    });


    console.log('formData', formData);

    // Envoi des données
    this.csvUploadService.uploadCsv(formData).subscribe(
      (response: any) => {
        this.message = 'Fichier téléversé avec succès.';
        this.messageType = 'success';
        this.downloadLink = response.finalCsvPath;
      },
      (error) => {
        console.error('Erreur:', error);
        this.message = 'Échec du téléversement.';
        this.messageType = 'error';
      }
    );
  }

  // Fermer les alertes
  closeAlert(): void {
    this.message = '';
    this.messageType = '';
  }
}
