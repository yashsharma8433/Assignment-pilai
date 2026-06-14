import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'
import type { Student, CreateStudentInput } from '@/types'

// ── Validation schema (mirrors server) ────────────────────────
const schema = z.object({
  name: z
    .string()
    .min(2, 'At least 2 characters')
    .max(100)
    .regex(/^[a-zA-Z\s.'-]+$/, 'Letters and basic punctuation only'),
  course: z.string().min(1, 'Required').max(100),
  year: z.coerce.number().int().min(1).max(6, 'Must be 1–6'),
  dob: z.string().min(1, 'Required').refine((v) => {
    const age = (Date.now() - new Date(v).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    return age >= 15
  }, 'Must be at least 15 years old'),
  email: z.string().email('Invalid email'),
  mobile: z.string().regex(/^\d{10}$/, 'Must be 10 digits'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Required' }),
  address: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Student>
  onSubmit: (data: CreateStudentInput) => Promise<void>
  isLoading: boolean
}

const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA', 'BBA', 'B.Com', 'M.Com', 'Other']

export function StudentForm({ defaultValues, onSubmit, isLoading }: Props) {
  const [step, setStep] = useState(1)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.photo_url ?? null,
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:    defaultValues?.name    ?? '',
      course:  defaultValues?.course  ?? '',
      year:    defaultValues?.year    ?? undefined,
      dob:     defaultValues?.dob     ? defaultValues.dob.slice(0, 10) : '',
      email:   defaultValues?.email   ?? '',
      mobile:  defaultValues?.mobile  ?? '',
      gender:  defaultValues?.gender  ?? undefined,
      address: defaultValues?.address ?? '',
    },
  })

  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => alert('File must be JPEG/PNG/WebP under 2MB'),
  })

  const handleNext = async () => {
    const valid = await trigger(['name', 'email', 'mobile', 'dob', 'gender', 'address'])
    if (valid) setStep(2)
  }

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      address: values.address || undefined,
      photo: photoFile ?? undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Step indicator */}
      <div className="steps">
        <div className={`step ${step === 1 ? 'active' : 'done'}`}>
          <div className="step-num">{step > 1 ? '✓' : '1'}</div>
          Personal Info
        </div>
        <div className="step-connector" />
        <div className={`step ${step === 2 ? 'active' : ''}`}>
          <div className="step-num">2</div>
          Academic &amp; Photo
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label" htmlFor="f-name">
                Full Name <span className="required">*</span>
              </label>
              <input id="f-name" className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Priya Sharma" {...register('name')} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="f-email">
                Email <span className="required">*</span>
              </label>
              <input id="f-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="student@example.com" {...register('email')} />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="f-mobile">
                Mobile <span className="required">*</span>
              </label>
              <input id="f-mobile" type="tel" maxLength={10}
                className={`form-input ${errors.mobile ? 'error' : ''}`}
                placeholder="10-digit number" {...register('mobile')} />
              {errors.mobile && <span className="form-error">{errors.mobile.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="f-dob">
                Date of Birth <span className="required">*</span>
              </label>
              <input id="f-dob" type="date" className={`form-input ${errors.dob ? 'error' : ''}`}
                max={new Date(Date.now() - 15 * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                {...register('dob')} />
              {errors.dob && <span className="form-error">{errors.dob.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="f-gender">
                Gender <span className="required">*</span>
              </label>
              <select id="f-gender" className={`form-select ${errors.gender ? 'error' : ''}`}
                {...register('gender')}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {errors.gender && <span className="form-error">{errors.gender.message}</span>}
            </div>

            <div className="form-group form-full">
              <label className="form-label" htmlFor="f-address">Address</label>
              <textarea id="f-address" className="form-textarea"
                placeholder="Full address (optional)" {...register('address')} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              Next →
            </button>
          </div>
        </>
      )}

      {/* Step 2: Academic + Photo */}
      {step === 2 && (
        <>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="f-course">
                Course <span className="required">*</span>
              </label>
              <select id="f-course" className={`form-select ${errors.course ? 'error' : ''}`}
                {...register('course')}>
                <option value="">Select course</option>
                {COURSES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.course && <span className="form-error">{errors.course.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="f-year">
                Year <span className="required">*</span>
              </label>
              <select id="f-year" className={`form-select ${errors.year ? 'error' : ''}`}
                {...register('year')}>
                <option value="">Select year</option>
                {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
              {errors.year && <span className="form-error">{errors.year.message}</span>}
            </div>
          </div>

          {/* Photo dropzone */}
          <div className="form-group mt-4">
            <label className="form-label">Student Photo (optional)</label>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} id="f-photo" />
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="dropzone-preview" />
                  <div className="dropzone-text">
                    <strong>Click or drag</strong> to replace photo
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8, color: 'var(--text-muted)' }}>
                    <Upload size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                  </div>
                  <div className="dropzone-text">
                    <strong>Click to upload</strong> or drag and drop<br />
                    <span style={{ fontSize: '0.75rem' }}>JPEG, PNG, WebP · Max 2MB</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving…' : defaultValues?.id ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
