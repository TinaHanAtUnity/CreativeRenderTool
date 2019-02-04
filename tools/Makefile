# Directories

SCRIPTS_DIR := release-scripts
DEPLOY_DIR := $(SCRIPTS_DIR)/Deployment
STAGING_DIR := $(SCRIPTS_DIR)/Staging

# Targets

STAGE_TARGETS := $(STAGING_DIR)/0.create_staging_branches.sh $(STAGING_DIR)/1.merge_master_changes.sh $(STAGING_DIR)/2.push_staging_branches.sh
STAGED_PR_TARGETS := $(STAGING_DIR)/3.create_deployment_prs.sh
DEPLOY_TARGETS := $(DEPLOY_DIR)/0.update_lkgs.sh $(DEPLOY_DIR)/1.merge_deployment_prs.sh
NOTIFY_TARGETS := $(DEPLOY_DIR)/notify_deployment_finished.sh
REVERT_TARGETS := $(SCRIPTS_DIR)/revert_to_lkgs.sh

# Built-in targets

.PHONY: staging prs deploy notify revert

# Main targets

staging:
	$(STAGE_TARGETS)

prs:
	$(STAGED_PR_TARGETS)

deploy:
	$(DEPLOY_TARGETS)

notify:
	$(NOTIFY_TARGETS)

revert:
	$(REVERT_TARGETS)
