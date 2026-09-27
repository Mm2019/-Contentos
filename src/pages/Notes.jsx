import SimpleEntity from './SimpleEntity'
export default function Notes(){return <SimpleEntity table="uos_notes" title="Notes" fields={[['title','عنوان الملاحظة'],['body','المحتوى']]} defaults={{title:'',body:''}}/>}
