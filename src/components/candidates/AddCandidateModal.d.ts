declare module './AddCandidateModal' {
  import { Candidate } from '../../lib/supabase';

  interface AddCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newCandidate: Candidate) => void;
  }

  const AddCandidateModal: React.FC<AddCandidateModalProps>;
  export default AddCandidateModal;
}
