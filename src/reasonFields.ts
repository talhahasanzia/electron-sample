export type FieldConfig = {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  placeholder?: string
  options?: string[]
}

export type ReasonConfig = {
  key: string
  label: string
  fields: FieldConfig[]
}

export const REASON_CONFIGS: ReasonConfig[] = [
  {
    key: 'inventory_purchase',
    label: 'Inventory Purchase',
    fields: [
      { name: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Supplier name' },
      { name: 'invoiceNumber', label: 'Invoice #', type: 'text', placeholder: 'Invoice number' },
    ],
  },
  {
    key: 'vehicle_transfer',
    label: 'Vehicle Transfer',
    fields: [
      { name: 'vehicleVIN', label: 'Vehicle VIN', type: 'text', placeholder: 'VIN' },
      { name: 'fromLocation', label: 'From', type: 'text', placeholder: 'From location' },
      { name: 'toLocation', label: 'To', type: 'text', placeholder: 'To location' },
    ],
  },
  {
    key: 'hospital_bill',
    label: 'Hospital Bill Payment',
    fields: [
      { name: 'patientName', label: 'Patient Name', type: 'text', placeholder: 'Patient full name' },
      { name: 'hospitalName', label: 'Hospital', type: 'text', placeholder: 'Hospital name' },
      { name: 'billNumber', label: 'Bill #', type: 'text', placeholder: 'Bill number' },
    ],
  },
  {
    key: 'insurance_claim',
    label: 'Insurance Claim',
    fields: [
      { name: 'policyNumber', label: 'Policy #', type: 'text', placeholder: 'Policy number' },
      { name: 'claimNumber', label: 'Claim #', type: 'text', placeholder: 'Claim number' },
      { name: 'incidentDate', label: 'Incident Date', type: 'date' },
    ],
  },
  {
    key: 'service_charge',
    label: 'Service Charge',
    fields: [
      { name: 'serviceProvider', label: 'Service Provider', type: 'text', placeholder: 'Provider name' },
      { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
    ],
  },
  {
    key: 'doctor_visit',
    label: 'Doctor Visit',
    fields: [
      { name: 'doctorName', label: 'Doctor Name', type: 'text', placeholder: 'Doctor full name' },
      { name: 'clinic', label: 'Clinic', type: 'text', placeholder: 'Clinic name' },
      { name: 'appointmentDate', label: 'Appointment Date', type: 'date' },
    ],
  },
]

