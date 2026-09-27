import SimpleEntity from './SimpleEntity'
export default function Reviews(){return <SimpleEntity table="uos_reviews" title="Reviews" fields={[['review_type',['weekly','monthly','quarterly'],'select'],['summary','الملخص']]} defaults={{review_type:'weekly',summary:''}}/>}
