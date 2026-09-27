import SimpleEntity from './SimpleEntity'
export default function Decisions(){return <SimpleEntity table="uos_decisions" title="Decisions" fields={[['title','عنوان القرار'],['decision','القرار'],['rationale','السبب']]} defaults={{title:'',decision:'',rationale:''}}/>}
