"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateBotSchema, UpdateBotSchema, type CreateBot, type UpdateBot, type BotDomain } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bot {
  id: string
  name: string
  domain: string
  uid: string
}

interface BotFormProps {
  onSuccess?: () => void
  editBot?: Bot
  trigger?: React.ReactNode
}

export function BotForm({ onSuccess, editBot, trigger }: BotFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const isEditing = !!editBot

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBot>({
    resolver: zodResolver(CreateBotSchema),
    defaultValues: editBot ? {
      name: editBot.name,
      domain: editBot.domain as BotDomain,
      uid: editBot.uid,
    } : undefined,
  })

  const domain = watch("domain")

  const onSubmit = async (data: CreateBot) => {
    setIsLoading(true)
    try {
      const url = isEditing ? `/api/bots/${editBot.id}` : "/api/bots"
      const method = isEditing ? "PATCH" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: isEditing ? "Bot updated successfully" : "Bot created successfully",
        })
        reset()
        setOpen(false)
        onSuccess?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} bot`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-balance">
            {isEditing ? "Edit AI Bot" : "Create New AI Bot"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bot Name</Label>
            <Input
              id="name"
              placeholder="e.g., Dr. Sarah Medical Assistant"
              {...register("name")}
              className="bg-input"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Select 
              onValueChange={(value) => setValue("domain", value as BotDomain)}
              defaultValue={editBot?.domain}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
            {errors.domain && <p className="text-sm text-destructive">{errors.domain.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="uid">Bot UID (Optional)</Label>
            <Input id="uid" placeholder="Leave empty to auto-generate" {...register("uid")} className="bg-input" />
            <p className="text-xs text-muted-foreground">Unique identifier for OpenMic integration</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Bot" : "Create Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
