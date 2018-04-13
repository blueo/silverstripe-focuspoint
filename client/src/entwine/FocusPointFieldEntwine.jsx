/* global window */
import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { schemaMerge } from 'lib/schemaFieldValues';
import { loadComponent } from 'lib/Injector';
import TextField from 'components/TextField/TextField';
/**
 * Shiv for inserting react FocusPointField into entwine forms
 */
jQuery.entwine('ss', ($) => {
  /**
   * See boot/index.js for `.react-boot` bootstrap
   */
  $('.js-injector-boot input.entwine-focuspointfield').entwine({
    Component: null,

    getContainer() {
      let container = this.siblings('.focuspointfield-holder')[0];
      if (!container) {
        const newContainer = $('<div class="focuspointfield-holder"></div>');
        this.before(newContainer);

        container = newContainer[0];
      }
      return container;
    },

    onunmatch() {
      this._super();
      // solves errors given by ReactDOM "no matched root found" error.
      ReactDOM.unmountComponentAtNode(this.siblings('.focuspointfield-holder')[0]);
    },

    onmatch() {
      const cmsContent = this.closest('.cms-content').attr('id');
      const context = (cmsContent)
        ? { context: cmsContent }
        : {};

      const FocusPointField = loadComponent('FocusPointField', context);
      this.setComponent(FocusPointField);

      this._super();
      this.hide();
      this.refresh();
    },

    // onclick(e) {
    //   // we don't want the native upload dialog to show up
    //   e.preventDefault();
    // },

    refresh() {
      const props = this.getAttributes();
      const form = $(this).closest('form');
      const onChange = () => {
        // Trigger change detection (see jquery.changetracker.js)
        setTimeout(() => {
          form.trigger('change');
        }, 0);
      };

      const FocusPointField = this.getComponent();
      const newProps = {...props, children: this.hydrateChildren(props.children) };
      // TODO: rework entwine so that react has control of holder
      ReactDOM.render(
        <FocusPointField
          {...newProps}
          onChange={onChange}
          noHolder
        />,
        this.getContainer()
      );
    },

    hydrateChildren(children) {
      return children.map((props) => {
        return (<TextField key={props.id} {...props} />);
      });
    },

    /**
     * Find the selected node and get attributes associated to attach the data to the form
     *
     * @returns {Object}
     */
    getAttributes() {
      const state = $(this).data('state');
      const schema = $(this).data('schema');
      return schemaMerge(schema, state);
    },
  });
});
