/** @odoo-module **/
// EcoSphere AI Supplier ranking definitions
export const SupplierRating = {
    computeScore: function(footprint, distance, hasIso) {
        return 100 - (footprint / 15) - (distance / 40) + (hasIso ? 15 : 0);
    }
};
