// Modal interactions and Form handling

// Global Action Interfaces
window.editPR = function (id) {

    const pr = window.globalPRs.find(p => String(p.id) === String(id));

    console.log('Editing PR:', pr);

    if (pr) {
        openModal(pr);
    } else {
        console.error('PR not found for editing:', id);
    }
};

window.deletePR = function (id) {
    if (window.openDeleteModal) {
        window.openDeleteModal(id);
    }
};

function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const btnCancel = document.getElementById('btn-cancel-delete');
    const btnConfirm = document.getElementById('btn-confirm-delete');

    window.openDeleteModal = function (id) {
        window.idToDelete = id;
        if (modal) modal.classList.remove('hidden');
    }

    function closeDeleteModal() {
        window.idToDelete = null;
        if (modal) modal.classList.add('hidden');
    }

    if (btnCancel) btnCancel.onclick = closeDeleteModal;

    if (btnConfirm) btnConfirm.onclick = async () => {
        if (!window.idToDelete) return;

        try {
            const response = await fetch(`/prs/${window.idToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Record deleted successfully');
                fetchPRs(); // Refresh all data
                closeDeleteModal();
            } else {
                showToast('Failed to delete record', 'error');
            }
        } catch (error) {
            console.error('Error deleting PR:', error);
            showToast('Error deleting record', 'error');
        }
    };
}

function populateExerciseDropdown() {
    const exerciseSelect = document.getElementById('exercise');
    if (!exerciseSelect) return;

    exerciseSelect.innerHTML = '';

    const exercises = Object.keys(EXERCISE_TO_MUSCLE).sort();

    const otherIndex = exercises.indexOf("Other");
    if (otherIndex > -1) {
        exercises.splice(otherIndex, 1);
    }

    exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        option.textContent = ex;
        exerciseSelect.appendChild(option);
    });
}

function populateMuscleDropdown() {
    const muscleSelect = document.getElementById('muscle_group');
    if (!muscleSelect) return;

    muscleSelect.innerHTML = '';

    MUSCLE_GROUPS.forEach(muscle => {
        const option = document.createElement('option');
        option.value = muscle;
        option.textContent = muscle;
        muscleSelect.appendChild(option);
    });
}


function setupModal() {
    console.log("DEBUG: setupModal called");
    const modal = document.getElementById('log-pr-modal');
    const btnLogPr = document.getElementById('btn-log-pr');
    const fabLogPr = document.getElementById('fab-log-pr');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('log-pr-form');
    const exerciseSelect = document.getElementById('exercise');
    const muscleSelect = document.getElementById('muscle_group');

    const modalTitle = document.getElementById('modal-title');
    const submitText = document.getElementById('modal-submit-text');

    window.openModal = function (pr = null) {
        if (modal) modal.classList.remove('hidden');

        if (pr) {

            window.currentEditingId = pr.id;
            modalTitle.textContent = 'Edit Personal Record';
            if (submitText) submitText.textContent = 'Update Record';

            if (document.getElementById('weight')) document.getElementById('weight').value = pr.weight;
            if (document.getElementById('reps')) document.getElementById('reps').value = pr.reps;

            if (exerciseSelect) {
                exerciseSelect.value = pr.exercise;
                exerciseSelect.dispatchEvent(new Event('change'));
            }

            if (muscleSelect) {
                muscleSelect.value = pr.muscle_group || EXERCISE_TO_MUSCLE[pr.exercise] || 'Other';
            }

        } else {
            window.currentEditingId = null;
            modalTitle.textContent = 'Log New Personal Record';
            if (submitText) submitText.textContent = 'Save Record';
            form.reset();

            if (exerciseSelect && muscleSelect) {
                exerciseSelect.dispatchEvent(new Event('change'));
            }
        }
    }

    function closeModal() {
        if (modal) modal.classList.add('hidden');
        if (form) form.reset();
        window.currentEditingId = null
        if (exerciseSelect && muscleSelect) {
            muscleSelect.value = EXERCISE_TO_MUSCLE[exerciseSelect.value] || 'Other';
        }
    }

    if (btnLogPr) btnLogPr.addEventListener('click', () => openModal());
    if (fabLogPr) fabLogPr.addEventListener('click', () => openModal());
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    const weightInput = document.getElementById('weight');
    const repsInput = document.getElementById('reps');

    const validateInput = (input, type) => {
        if (input.validity.rangeUnderflow) {
            input.setCustomValidity(`${type} must be positive! The laws of physics apply here 🍎`);
        } else if (input.validity.valueMissing) {
            input.setCustomValidity(`Please enter the ${type.toLowerCase()}.`);
        } else {
            input.setCustomValidity('');
        }
    };

    if (weightInput) {
        weightInput.addEventListener('invalid', () => validateInput(weightInput, 'Weight'));
        weightInput.addEventListener('input', () => {
            weightInput.setCustomValidity(''); // Clear on type to allow re-check on submit
        });
    }

    if (repsInput) {
        repsInput.addEventListener('invalid', () => validateInput(repsInput, 'Reps'));
        repsInput.addEventListener('input', () => {
            repsInput.setCustomValidity('');
        });
    }

    if (exerciseSelect) {
        exerciseSelect.addEventListener('change', () => {
            const exercise = exerciseSelect.value;
            const mappedMuscle = EXERCISE_TO_MUSCLE[exercise];
            if (mappedMuscle && muscleSelect) {
                muscleSelect.value = mappedMuscle;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);

            const data = {
                exercise: formData.get('exercise'),
                muscle_group: formData.get('muscle_group'),
                weight: parseFloat(formData.get('weight')),
                reps: parseInt(formData.get('reps'))
            };

            try {
                let response;

                if (window.currentEditingId) {
                    console.log('Updating PR:', window.currentEditingId);
                    response = await fetch(`/prs/${window.currentEditingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                } else {
                    console.log('Creating PR');
                    response = await fetch('/prs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                }

                if (response.ok) {
                    closeModal();
                    showToast(window.currentEditingId ? 'Record updated successfully!' : 'Personal Record logged successfully!');
                    fetchPRs();
                } else {
                    const errorData = await response.json();
                    showToast('Failed to save PR: ' + (errorData.detail || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Error saving PR:', error);
                showToast('Error saving PR: ' + error.message, 'error');
            }
        });
    }
}
