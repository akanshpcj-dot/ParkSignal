export default function SafetyNotice() { 
  return ( 
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-900 dark:text-gray-100"> 
      <h1 className="text-2xl font-semibold mb-6">Safety Notice</h1> 

      <p className="mb-4"> 
        ParkSignal is intended for polite, non-emergency communication regarding 
        parked vehicles. 
      </p> 

      <h2 className="text-lg font-medium mt-8 mb-2"> 
        Not an Emergency Service 
      </h2> 
      <p className="mb-4"> 
        ParkSignal must not be used for medical, police, fire, or other emergency 
        situations. In emergencies, contact local authorities immediately. 
      </p> 

      <h2 className="text-lg font-medium mt-8 mb-2">Personal Safety</h2> 
      <p className="mb-4"> 
        Avoid confrontational language. Do not meet unknown individuals in 
        isolated locations. Keep interactions brief and respectful. 
      </p> 

      <h2 className="text-lg font-medium mt-8 mb-2"> 
        Vehicle Owner Responsibility 
      </h2> 
      <p className="mb-4"> 
        Vehicle owners are responsible for keeping contact details accurate and 
        disabling QR codes if misuse occurs. 
      </p> 

      <h2 className="text-lg font-medium mt-8 mb-2"> 
        No Monitoring or Intervention 
      </h2> 
      <p> 
        ParkSignal does not monitor, record, or intervene in communications 
        between users. 
      </p> 
    </div> 
  ); 
}
