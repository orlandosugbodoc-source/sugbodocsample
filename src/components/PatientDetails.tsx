import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import type { PatientMetadata } from "../utils/gemini";
import { User, Calendar } from "lucide-react";

interface PatientDetailsProps {
  details: PatientMetadata;
  onChange: (details: PatientMetadata) => void;
  disabled?: boolean;
}

function formatAgeDOB(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // 1. If it already has the "Age / YYYY-MM-DD" or "Age / YYYY" format, keep it
  const parts = trimmed.split("/");
  if (parts.length === 2 && !isNaN(parseInt(parts[0].trim()))) {
    return `${parts[0].trim()} / ${parts[1].trim()}`;
  }

  const currentYear = new Date().getFullYear();

  // 2. Just a birth year (e.g., 1997)
  if (/^\d{4}$/.test(trimmed)) {
    const year = parseInt(trimmed);
    if (year > 1900 && year <= currentYear) {
      return `${currentYear - year} / ${year}`;
    }
  }

  // 3. Just an age with optional text (e.g., "29", "29 years", "29y", "29 yo")
  const ageOnlyMatch = trimmed.match(/^(\d+)\s*(?:y(?:ears?)?\s*(?:old)?)?$/i);
  if (ageOnlyMatch) {
    const age = parseInt(ageOnlyMatch[1]);
    if (age >= 0 && age < 130) {
      return `${age}`;
    }
  }

  // 4. Date format matching: YYYY-MM-DD, MM/DD/YYYY, etc.
  const normalized = trimmed.replace(/[-/.]/g, "-");
  
  // YYYY-MM-DD format
  const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const matchY = normalized.match(yyyymmdd);
  
  // MM-DD-YYYY or DD-MM-YYYY format
  const shortDate = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/;
  const matchS = normalized.match(shortDate);

  let birthDate: Date | null = null;
  let formattedDate = "";

  if (matchY) {
    const year = parseInt(matchY[1]);
    const month = parseInt(matchY[2]) - 1;
    const day = parseInt(matchY[3]);
    birthDate = new Date(year, month, day);
    formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  } else if (matchS) {
    const val1 = parseInt(matchS[1]);
    const val2 = parseInt(matchS[2]);
    let year = parseInt(matchS[3]);
    if (year < 100) {
      year += year > 26 ? 1900 : 2000;
    }
    
    let month = 0;
    let day = 1;
    if (val1 > 12) {
      day = val1;
      month = val2 - 1;
    } else {
      month = val1 - 1;
      day = val2;
    }
    birthDate = new Date(year, month, day);
    formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  if (birthDate && !isNaN(birthDate.getTime())) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age >= 0 && age < 130) {
      return `${age} / ${formattedDate}`;
    }
  }

  return trimmed;
}

function liveFormatAgeDOB(value: string, oldValue: string): string {
  if (value.length < oldValue.length) {
    return value;
  }

  const input = value.replace(/\s+/g, " ");

  // 1. If it starts with a 4-digit number (e.g. 1997 or 19970412)
  if (/^\d{4}/.test(input)) {
    const rawDigits = input.replace(/\D/g, "");
    const currentYear = new Date().getFullYear();
    const yearStr = rawDigits.slice(0, 4);
    const monthStr = rawDigits.slice(4, 6);
    const dayStr = rawDigits.slice(6, 8);

    const year = parseInt(yearStr);
    let age = currentYear - year;
    if (age < 0 || age > 130) age = 0;

    let datePart = yearStr;
    if (monthStr) datePart += "-" + monthStr;
    if (dayStr) datePart += "-" + dayStr;

    return `${age} / ${datePart}`;
  }

  // 2. If it has a slash (e.g. 29 / 1997)
  const parts = input.split("/");
  if (parts.length === 2) {
    const agePart = parts[0].trim();
    const dateInput = parts[1].trim();
    const rawDigits = dateInput.replace(/\D/g, "");
    
    let datePart = "";
    if (rawDigits.length > 0) {
      datePart += rawDigits.slice(0, 4);
    }
    if (rawDigits.length > 4) {
      datePart += "-" + rawDigits.slice(4, 6);
    }
    if (rawDigits.length > 6) {
      datePart += "-" + rawDigits.slice(6, 8);
    }
    return `${agePart} / ${datePart}`;
  }

  // 3. Auto-insert slash when typing a space after a number
  if (/^\d{1,3}\s$/.test(input) && oldValue.trim() === input.trim()) {
    return `${input.trim()} / `;
  }

  // 4. Exact 4-digit year typed directly
  if (/^\d{4}$/.test(input)) {
    const year = parseInt(input);
    const currentYear = new Date().getFullYear();
    if (year > 1900 && year <= currentYear) {
      return `${currentYear - year} / ${year}`;
    }
  }

  return input;
}

function getAgeDOBHint(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const currentYear = new Date().getFullYear();

  // Pattern 1: User typed a simple age, e.g. "29" or "9"
  if (/^\d{1,3}$/.test(trimmed)) {
    const age = parseInt(trimmed);
    if (age >= 0 && age < 130) {
      const calculatedYear = currentYear - age;
      return ` / ${calculatedYear}-04-12`;
    }
  }

  // Pattern 2: User typed "29 " (has a trailing space after age)
  if (/^\d{1,3}\s$/.test(value)) {
    const age = parseInt(trimmed);
    if (age >= 0 && age < 130) {
      const calculatedYear = currentYear - age;
      return `/ ${calculatedYear}-04-12`;
    }
  }

  // Pattern 3: User typed "29 / "
  if (/^\d{1,3}\s*\/\s*$/.test(trimmed)) {
    const age = parseInt(trimmed.split("/")[0].trim());
    const calculatedYear = currentYear - age;
    return `${calculatedYear}-04-12`;
  }

  // Pattern 4: User typed part of the date, e.g. "29 / 19"
  const parts = value.split("/");
  if (parts.length === 2) {
    const agePart = parts[0].trim();
    const datePart = parts[1].trim();

    const age = parseInt(agePart);
    if (!isNaN(age)) {
      const targetYear = currentYear - age;
      const targetDate = `${targetYear}-04-12`;

      if (targetDate.startsWith(datePart)) {
        return targetDate.slice(datePart.length);
      }
    }
  }

  return "";
}

export function PatientDetails({ details, onChange, disabled }: PatientDetailsProps) {
  const handleInputChange = (field: keyof PatientMetadata, value: string) => {
    onChange({
      ...details,
      [field]: value
    });
  };

  const handleAgeChange = (val: string) => {
    const formatted = liveFormatAgeDOB(val, details.age);
    handleInputChange("age", formatted);
  };

  const handleAgeBlur = () => {
    const formatted = formatAgeDOB(details.age);
    handleInputChange("age", formatted);
  };

  const hint = getAgeDOBHint(details.age);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && hint) {
      e.preventDefault(); // Prevent focus switch
      handleInputChange("age", details.age + hint);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-center space-x-2">
        <User className="w-5 h-5 text-primary" />
        <CardTitle className="text-gray-900 text-base font-semibold">Patient & Visit Details</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3.5 flex-grow pt-4">
        {/* Patient Name */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="patient-name" className="text-xs font-semibold text-gray-500">
            Patient Name
          </label>
          <input
            id="patient-name"
            type="text"
            placeholder="e.g., Juan dela Cruz"
            value={details.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={disabled}
            className="w-full bg-white border border-gray-200 rounded-xl text-sm px-3.5 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        </div>

        {/* Age and Gender Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col space-y-1">
            <label htmlFor="patient-age" className="text-xs font-semibold text-gray-500">
              Age / DOB
            </label>
            <div className="relative w-full">
              {hint && (
                <div 
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5 py-2.5 text-sm font-sans select-none pointer-events-none text-transparent whitespace-pre leading-relaxed"
                  style={{ font: 'inherit' }}
                >
                  <span>{details.age}</span>
                  <span className="text-gray-300 font-medium">{hint}</span>
                </div>
              )}
              <input
                id="patient-age"
                type="text"
                placeholder="e.g., 29 / 1997-04-12"
                value={details.age}
                onChange={(e) => handleAgeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAgeBlur}
                disabled={disabled}
                className="w-full bg-white border border-gray-200 rounded-xl text-sm px-3.5 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary disabled:opacity-60 font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="patient-gender" className="text-xs font-semibold text-gray-500">
              Gender
            </label>
            <select
              id="patient-gender"
              value={details.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              disabled={disabled}
              className="w-full bg-white border border-gray-200 rounded-xl text-sm px-3.5 py-2.5 text-gray-800 focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary disabled:opacity-60 cursor-pointer"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Declined">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Date of Visit */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="visit-date" className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Date of Visit
          </label>
          <input
            id="visit-date"
            type="date"
            value={details.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            disabled={disabled}
            className="w-full bg-white border border-gray-200 rounded-xl text-sm px-3.5 py-2.5 text-gray-800 focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        </div>
      </CardContent>
    </Card>
  );
}
