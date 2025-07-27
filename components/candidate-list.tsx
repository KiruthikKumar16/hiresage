"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Edit,
  Trash2,
  Loader2,
  Save,
  X
} from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  status: "new" | "interviewed" | "hired" | "rejected"
  score?: number
  lastInterview?: Date
  experience: string
  skills: string[]
  resume?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const candidateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  position: z.string().min(1, "Position is required"),
  experience: z.string().min(1, "Experience is required"),
  skills: z.string().min(1, "Skills are required"),
  status: z.enum(["new", "interviewed", "hired", "rejected"]),
  resume: z.string().optional(),
  notes: z.string().optional(),
})

type CandidateFormData = z.infer<typeof candidateSchema>

export function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [deletingCandidate, setDeletingCandidate] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  })

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/candidates')
      const data = await response.json()
      
      if (data.success) {
        setCandidates(data.data)
      } else {
        toast.error('Failed to fetch candidates')
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast.error('Failed to fetch candidates')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CandidateFormData) => {
    try {
      const candidateData = {
        ...data,
        skills: data.skills.split(',').map(skill => skill.trim()),
      }

      const url = editingCandidate ? `/api/candidates/${editingCandidate.id}` : '/api/candidates'
      const method = editingCandidate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editingCandidate ? 'Candidate updated successfully!' : 'Candidate created successfully!')
        setIsDialogOpen(false)
        reset()
        setEditingCandidate(null)
        fetchCandidates()
      } else {
        toast.error(result.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error saving candidate:', error)
      toast.error('Failed to save candidate')
    }
  }

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setValue('name', candidate.name)
    setValue('email', candidate.email)
    setValue('phone', candidate.phone)
    setValue('position', candidate.position)
    setValue('experience', candidate.experience)
    setValue('skills', candidate.skills.join(', '))
    setValue('status', candidate.status)
    setValue('resume', candidate.resume || '')
    setValue('notes', candidate.notes || '')
    setIsDialogOpen(true)
  }

  const handleDelete = async (candidateId: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return

    try {
      setDeletingCandidate(candidateId)
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Candidate deleted successfully!')
        fetchCandidates()
      } else {
        toast.error(result.message || 'Failed to delete candidate')
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
      toast.error('Failed to delete candidate')
    } finally {
      setDeletingCandidate(null)
    }
  }

  const handleNewCandidate = () => {
    setEditingCandidate(null)
    reset()
    setIsDialogOpen(true)
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || candidate.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-600 text-white">New</Badge>
      case "interviewed":
        return <Badge className="bg-yellow-600 text-white">Interviewed</Badge>
      case "hired":
        return <Badge className="bg-green-600 text-white">Hired</Badge>
      case "rejected":
        return <Badge className="bg-red-600 text-white">Rejected</Badge>
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-yellow-400"
    return "text-red-400"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mr-2" />
        <span className="text-slate-300">Loading candidates...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Candidates</h2>
          <p className="text-slate-300">Manage your candidate profiles and track their progress</p>
        </div>
        <Button 
          onClick={handleNewCandidate}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{candidate.name}</CardTitle>
                      <CardDescription className="text-slate-300">{candidate.position}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(candidate.status)}
                    {candidate.score && (
                      <span className={`text-sm font-medium ${getScoreColor(candidate.score)}`}>
                        {candidate.score}/10
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{candidate.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{candidate.experience} experience</span>
                  </div>
                  {candidate.lastInterview && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        Last interview: {new Date(candidate.lastInterview).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {candidate.notes && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Notes:</p>
                    <p className="text-sm text-slate-300 line-clamp-2">{candidate.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(candidate)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(candidate.id)}
                      disabled={deletingCandidate === candidate.id}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      {deletingCandidate === candidate.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(candidate.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No candidates found</h3>
            <p className="text-slate-300 mb-4">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first candidate"
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button 
                onClick={handleNewCandidate}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Candidate
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Candidate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {editingCandidate 
                ? 'Update candidate information and status'
                : 'Add a new candidate to your database'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Name</label>
                <Input
                  {...register("name")}
                  placeholder="Full name"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Email</label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="email@example.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Phone</label>
                <Input
                  {...register("phone")}
                  placeholder="+1 (555) 123-4567"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Position</label>
                <Input
                  {...register("position")}
                  placeholder="e.g., Frontend Developer"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.position && (
                  <p className="text-red-400 text-sm mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Experience</label>
                <Input
                  {...register("experience")}
                  placeholder="e.g., 3 years"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.experience && (
                  <p className="text-red-400 text-sm mt-1">{errors.experience.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Status</label>
                <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={editingCandidate?.status || "new"}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Skills (comma-separated)</label>
              <Input
                {...register("skills")}
                placeholder="React, TypeScript, Node.js"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              {errors.skills && (
                <p className="text-red-400 text-sm mt-1">{errors.skills.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Resume URL (optional)</label>
              <Input
                {...register("resume")}
                placeholder="https://example.com/resume.pdf"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Notes (optional)</label>
              <Textarea
                {...register("notes")}
                placeholder="Additional notes about the candidate..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingCandidate ? 'Update' : 'Create'} Candidate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 