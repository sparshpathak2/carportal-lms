import { IconAlertCircle } from '@tabler/icons-react'
import React from 'react'

export default function LeadTasksComponent() {
    return (
        <div className='flex items-center justify-center w-full h-full border-dotted border-2'>
            <div className="flex flex-col gap-3 items-center">
                <IconAlertCircle className="w-8 h-8" />
                <div className="flex flex-col items-center gap-1">
                    <div>Lead tasks not found</div>
                    {/* <div className="text-sm">The lead could not be found</div> */}
                </div>
            </div>
        </div>
    )
}
