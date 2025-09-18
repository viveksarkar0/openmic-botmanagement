import { type NextRequest, NextResponse } from "next/server"
import { openmic } from "@/lib/openmic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
   
    const caseId = body.id || body.case_id || body.caseId || body.arguments?.id || body.parameters?.id || "456"
  
    const caseDetails = openmic.generateFetchDetails(caseId, "legal")

    const responseMessage = `Found case for ${caseDetails.name} (Case ID: ${caseDetails.id}). Case type: ${caseDetails.cases?.join(', ') || 'General legal matter'}. Status: ${caseDetails.status}. Notes: ${caseDetails.notes}`


    return NextResponse.json({
      success: true,
      result: responseMessage,
      data: caseDetails
    })
  } catch (error) {
    console.error("Error in fetch_case_details:", error)

    // Fallback response
    const fallbackMessage = "Found case for Mary Johnson (Case ID: 456). Case type: Contract case. Status: Active. Notes: Meeting scheduled."
    
    return NextResponse.json({
      success: true,
      result: fallbackMessage,
      data: {
        id: "456",
        name: "Mary Johnson",
        cases: ["Contract case"],
        status: "Active",
        notes: "Meeting scheduled"
      }
    })
  }
}
